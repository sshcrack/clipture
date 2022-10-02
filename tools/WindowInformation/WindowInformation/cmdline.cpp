#include <string>
#include <vector>
#include <iostream>
#include <sstream>
#include <windows.h>
#include <stdio.h>
#include <winternl.h>
#include "ntqueries.h"
#include <codecvt>
#include "dstr.h"


using namespace std;

string getArguments(string cmdLine) {
	bool inQuotes = false;
	bool escaped = false;
	bool firstArg = true;
	stringstream currArg;
	vector<string> args;
	for (char const& c : cmdLine) {
		if (c == '"') {
			if (!escaped) {
				inQuotes = !inQuotes;
			}
		}

		if(c == '\\') {
			escaped = true;
		}

		if (inQuotes || c != ' ') {
			currArg << c;
		}
		else {
			string arg = currArg.str();
			if (arg.starts_with('"')) {
				arg = arg.substr(1);
			}

			if (arg.ends_with('"')) {
				arg = arg.substr(0, arg.length() - 1);
			}

			replace_json_specials(arg);
			args.push_back('"' + arg + '"');
			currArg.clear();
			currArg.str(std::string());
		}
		escaped = false;
	}

	string outerArg = currArg.str();
	if (outerArg.length() != 0) {
		replace_json_specials(outerArg);
		args.push_back('"' + outerArg + '"');
	}

	return join_vector(args, ",");
}

extern bool GetArgumentsHWND(HWND wnd, string &argumentsStr) {
	DWORD id[MAX_PATH];
	GetWindowThreadProcessId(wnd, id);

	HANDLE handle = OpenProcess(PROCESS_VM_READ | PROCESS_QUERY_INFORMATION, FALSE, *id);
	if (handle == 0)
		return false;


	// BASED ON http://stackoverflow.com/questions/7446887/get-command-line-string-of-64-bit-process-from-32-bit-process
	 // and a few other internet sources
	 // and painful 2-hour debugging session (because of the 32 vs 64 bit memory layout problems).
	DWORD err = 0;

	// determine if 64 or 32-bit processor
	SYSTEM_INFO si;
	GetNativeSystemInfo(&si);

	// determine if this process is running on WOW64
	BOOL wow;
	IsWow64Process(GetCurrentProcess(), &wow);

	// use WinDbg "dt ntdll!_PEB" command and search for ProcessParameters offset to find the truth out
	DWORD ProcessParametersOffset = si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64 ? 0x20 : 0x10;
	DWORD CommandLineOffset = si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64 ? 0x70 : 0x40;

	// read basic info to get ProcessParameters address, we only need the beginning of PEB
	DWORD pebSize = ProcessParametersOffset + 8;
	PBYTE peb = new BYTE[pebSize]{};

	// read basic info to get CommandLine address, we only need the beginning of ProcessParameters
	DWORD ppSize = CommandLineOffset + 16;
	PBYTE pp = new BYTE[ppSize]{};

	PWSTR cmdLine;

	if (wow) {
		// we're running as a 32-bit process in a 64-bit OS
		PROCESS_BASIC_INFORMATION_WOW64 pbi{};

		// read PEB from 64-bit address space
		auto read = (_NtWow64ReadVirtualMemory64)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtWow64ReadVirtualMemory64");

		// get process information from 64-bit world
		auto query = (_NtQueryInformationProcess)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtWow64QueryInformationProcess64");
		err = query(handle, 0, &pbi, sizeof(pbi), NULL);
		if (err != 0) {
			CloseHandle(handle);
			return false;
		}

		err = read(handle, pbi.PebBaseAddress, peb, pebSize, NULL);
		if (err != 0) {
			CloseHandle(handle);
			return false;
		}

		// read ProcessParameters from 64-bit address space
		auto parameters = (PBYTE*)*(LPVOID*)(peb + ProcessParametersOffset); // address in remote process adress space
		err = read(handle, parameters, pp, ppSize, NULL);
		if (err != 0) {
			CloseHandle(handle);
			return false;
		}

		// read CommandLine
		auto pCommandLine = (UNICODE_STRING_WOW64*)(pp + CommandLineOffset);
		cmdLine = (PWSTR) new char[pCommandLine->MaximumLength];
		err = read(handle, pCommandLine->Buffer, cmdLine, pCommandLine->MaximumLength, NULL);
		if (err != 0) {
			CloseHandle(handle);
			return false;
		}
	}
	else {
		// get process information
		auto query = (_NtQueryInformationProcess)GetProcAddress(GetModuleHandleA("ntdll.dll"), "NtQueryInformationProcess");

		// we're running as a 32-bit process in a 32-bit OS, or as a 64-bit process in a 64-bit OS
		PROCESS_BASIC_INFORMATION pbi{};

		err = query(handle, 0, &pbi, sizeof(pbi), NULL);
		if (err != 0) {
			CloseHandle(handle);
			return false;
		}

		// read PEB
		if (!ReadProcessMemory(handle, pbi.PebBaseAddress, peb, pebSize, NULL)) {
			CloseHandle(handle);
			return false;
		}

		// read ProcessParameters
		auto parameters = (PBYTE*)*(LPVOID*)(peb + ProcessParametersOffset); // address in remote process adress space
		if (!ReadProcessMemory(handle, parameters, pp, ppSize, NULL)) {
			CloseHandle(handle);
			return false;
		}

		// read CommandLine
		auto pCommandLine = (UNICODE_STRING*)(pp + CommandLineOffset);
		cmdLine = (PWSTR) new char[pCommandLine->MaximumLength];
		if (!ReadProcessMemory(handle, pCommandLine->Buffer, cmdLine, pCommandLine->MaximumLength, NULL)) {
			CloseHandle(handle);
			return false;
		}
	}

	wstring m_cmd = wstring(cmdLine);
    string str(m_cmd.begin(), m_cmd.end());

	argumentsStr = getArguments(str);
}