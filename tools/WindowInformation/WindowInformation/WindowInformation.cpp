// WindowClassGetter.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#pragma comment (lib, "dwmapi.lib")

#include <iostream>
#include <format>
#include <windows.h>
#include <windows.h>
#include <WinUser.h>
#include <string>


#include <Psapi.h>
#include <filesystem>

#include "tools.h"
#include "dstr.h"
#include "validators.h"
#include "window.h"
#include  "game.h"

using namespace std;
namespace fs = std::filesystem;

void GetWindowClass(HWND wnd, string& className) {
    TCHAR curr[MAX_PATH];
    WCHAR path[MAX_PATH];

    GetClassName(wnd, curr, MAX_PATH);

    wstring wclass(curr);
    string temp(wclass.begin(), wclass.end());

    className = temp;
}

void GetTitle(HWND hwnd, string& title) {
    int len; 

    len = GetWindowTextLengthW(hwnd);
    if (!len)
        return;

    if (len > 1024) {
        TCHAR chartemp[2052];
        if (!GetWindowTextW(hwnd, chartemp, len + 1))
            return;

        wstring wtemp(chartemp);
        string temp(wtemp.begin(), wtemp.end());

        title = temp;
    }
    else {
        wchar_t chartemp[1024 + 1];

        if (!GetWindowTextW(hwnd, chartemp, len + 1))
            return;

        wstring wtemp(chartemp);
        string temp(wtemp.begin(), wtemp.end());

        title = temp;
    }
}



bool GetExe(HWND wnd, string& executable) {
    TCHAR path_buf[MAX_PATH];
    DWORD id[MAX_PATH];
    GetWindowThreadProcessId(wnd, id);

    HANDLE hProc = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_TERMINATE, FALSE, *id);
    if (hProc == 0)
        return false;


    if (GetModuleFileNameEx(hProc, NULL, path_buf, MAX_PATH) == 0)
        return false;

    wstring wexe(path_buf);
    string exe(wexe.begin(), wexe.end());
    fs::path p(exe);

    executable = p.filename().string();

    CloseHandle(hProc);
    return true;
}

bool GetOBSid(HWND hwnd, string& str, bool gameMode) {
    string exe, title, className;

    if (!GetExe(hwnd, exe))
        return false;
    if (isMicrosoftInternalExe(exe.data()))
        return false;

    if (exe.compare("obs64.exe") == 0)
        return false;


    if (gameMode && isBlacklistedWindow(exe.data())) {
        return false;
    }

    GetTitle(hwnd , title);
    GetWindowClass(hwnd, className);

    DWORD pid[MAX_PATH];
    GetWindowThreadProcessId(hwnd, pid);
    string str_pid = ConvertToString(*pid);

    str = std::format("{{\"className\": \"{}\", \"executable\": \"{}\", \"title\": \"{}\", \"pid\": {}}}", className, exe, title, str_pid);
    return true;
}


int main(int argc, char** argv)
{
    HWND parent;
    WindowSearchMode mode = WindowSearchMode::EXCLUDE_MINIMIZED;
    bool checkGame = false;
    bool UseFindWindowEx = false;

    HWND window = FirstWindow(mode, &parent, &UseFindWindowEx);

    if (argc >= 2) {
        string firstArg(argv[1]);
        if (firstArg.compare("game") == 0) {
            checkGame = true;
            mode = WindowSearchMode::INCLUDE_MINIMIZED;
        }
    }

    int count = 0;
    cout << "[";
    while (window) {
        HWND curr = GetConsoleWindow();


        if (curr != window) {
            string jsonOut;
            if (GetOBSid(window, jsonOut, checkGame)) {
                if (count != 0)
                    cout << ",";
                cout << jsonOut;
                count++;
            }
        }

        window = NextWindow(window, mode, &parent, UseFindWindowEx);
    }
    cout << "]";
}
