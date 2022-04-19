#pragma comment (lib, "dwmapi.lib")
#pragma comment (lib, "Version.lib")
#pragma comment (lib, "User32.lib")


#include <iostream>
#include <string>
#include <vector>
#include <windows.h>
#include <WinUser.h>
#include <winver.h>
#include <sdkddkver.h>

#include <memory>
#include <string>
#include <cstddef>

#include "validators.h"


#define SZ_STRING_FILE_INFO_W L"StringFileInfo"
#define SZ_PRODUCT_NAME_W L"ProductName"
#define SZ_HEX_LANG_ID_EN_US_W L"0409"
#define SZ_HEX_CODE_PAGE_ID_UNICODE_W L"04B0"

using namespace std;

extern bool IsUWPWindow(HWND hwnd)
{
	wchar_t name[256];

	name[0] = 0;
	if (!GetClassNameW(hwnd, name, sizeof(name) / sizeof(wchar_t)))
		return false;

	return wcscmp(name, L"ApplicationFrameWindow") == 0;
}

extern HWND GetUWPActualWindow(HWND parent)
{
	DWORD parent_id = 0;
	HWND child;

	GetWindowThreadProcessId(parent, &parent_id);
	child = FindWindowEx(parent, NULL, NULL, NULL);

	while (child) {
		DWORD child_id = 0;
		GetWindowThreadProcessId(child, &child_id);

		if (child_id != parent_id)
			return child;

		child = FindWindowEx(parent, child, NULL, NULL);
	}

	return NULL;
}


extern HWND NextWindow(HWND window, enum WindowSearchMode mode, HWND* parent,
	bool UseFindWindowEx)
{
	if (*parent) {
		window = *parent;
		*parent = NULL;
	}

	while (true) {
		if (UseFindWindowEx)
			window = FindWindowEx(GetDesktopWindow(), window, NULL,
				NULL);
		else
			window = GetNextWindow(window, GW_HWNDNEXT);

		if (!window || IsWindowValid(window, mode))
			break;
	}

	if (IsUWPWindow(window)) {
		HWND child = GetUWPActualWindow(window);
		if (child) {
			*parent = window;
			return child;
		}
	}

	return window;
}

extern HWND FirstWindow(enum WindowSearchMode mode, HWND* parent,
	bool* UseFindWindowEx)
{
	HWND window = FindWindowEx(GetDesktopWindow(), NULL, NULL, NULL);

	if (!window) {
		*UseFindWindowEx = false;
		window = GetWindow(GetDesktopWindow(), GW_CHILD);
	}
	else {
		*UseFindWindowEx = true;
	}

	*parent = NULL;

	if (!IsWindowValid(window, mode)) {
		window = NextWindow(window, mode, parent, *UseFindWindowEx);

		if (!window && *UseFindWindowEx) {
			*UseFindWindowEx = false;

			window = GetWindow(GetDesktopWindow(), GW_CHILD);
			if (!IsWindowValid(window, mode))
				window = NextWindow(window, mode, parent,
					*UseFindWindowEx);
		}
	}

	if (IsUWPWindow(window)) {
		HWND child = GetUWPActualWindow(window);
		if (child) {
			*parent = window;
			return child;
		}
	}

	return window;
}

extern void GetAllWindowsFromProcessID(DWORD dwProcessID, vector<HWND>& vhWnds)
{
	// find all hWnds (vhWnds) associated with a process id (dwProcessID)
	HWND hCurWnd = nullptr;
	do
	{
		hCurWnd = FindWindowEx(nullptr, hCurWnd, nullptr, nullptr);
		DWORD checkProcessID = 0;
		GetWindowThreadProcessId(hCurWnd, &checkProcessID);
		if (checkProcessID == dwProcessID)
		{
			vhWnds.push_back(hCurWnd);  // add the found hCurWnd to the vector
			//wprintf(L"Found hWnd %d\n", hCurWnd);
		}
	} while (hCurWnd != nullptr);
}

extern bool GetProductNameFromExe(string full_exe, string& productName)
{
	wstring convert(full_exe.begin(), full_exe.end());
	LPCWSTR exe_lpw = convert.c_str();

	[[maybe_unused]] DWORD dummy{};
	auto const required_buffer_size
	{
		::GetFileVersionInfoSizeExW
		(
			FILE_VER_GET_NEUTRAL, exe_lpw, ::std::addressof(dummy)
		)
	};
	if (0 == required_buffer_size)
	{
		return false;
	}
	auto const p_buffer
	{
		::std::make_unique<char[]>
		(
			static_cast<::std::size_t>(required_buffer_size)
		)
	};
	auto const get_version_info_result
	{
		::GetFileVersionInfoExW
		(
			FILE_VER_GET_NEUTRAL
		,   exe_lpw
		,   DWORD{}
		,   required_buffer_size
		,   static_cast<void*>(p_buffer.get())
		)
	};
	if (FALSE == get_version_info_result)
	{
		return false;
	}
	LPVOID p_value{};
	UINT value_length{};
	bool query_result = VerQueryValueW
	(
		static_cast<void*>(p_buffer.get())
		, L"\\" SZ_STRING_FILE_INFO_W
		L"\\" SZ_HEX_LANG_ID_EN_US_W SZ_HEX_CODE_PAGE_ID_UNICODE_W
		L"\\" SZ_PRODUCT_NAME_W
		, ::std::addressof(p_value)
		, ::std::addressof(value_length)
	);

	if
		(
			(FALSE == query_result)
			or
			(nullptr == p_value)
			or
			((required_buffer_size / sizeof(wchar_t)) < value_length)
			)
	{
		return false;
	}
	wstring const w_product_name
	{
		static_cast<wchar_t const*>(p_value)
	,   static_cast<::std::size_t>(value_length)
	};

	string temp(w_product_name.begin(), w_product_name.end());
	productName = temp;
	return true;
}

extern bool HWNDToMonitor(HWND hwnd, HMONITOR& monitor)
{
	monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
	return monitor != NULL;
}

extern bool InterceptsWithMultipleMonitors(HWND hwnd) 
{
	HMONITOR monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONULL);
	return monitor != NULL;
}

extern bool GetMonitorDimensions(HMONITOR monitor, int& width, int& height)
{
	MONITORINFO info{};
	info.cbSize = sizeof(info);
	if (!GetMonitorInfoA(monitor, &info)) {
		return false;
	}

	width = info.rcMonitor.right - info.rcMonitor.left;
	height = info.rcMonitor.bottom - info.rcMonitor.top;
	return true;
}