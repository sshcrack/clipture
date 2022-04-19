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



bool GetExe(HWND wnd, string& executable, bool fullPath = false) {
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
    CloseHandle(hProc);
    if (fullPath) {
        executable = exe;
        return true;
    }
    fs::path p(exe);

    executable = p.filename().string();

    return true;
}

bool invalidChar(char c)
{
    return c == 0;
}
void stripUnicode(string& str)
{
    str.erase(remove_if(str.begin(), str.end(), invalidChar), str.end());
}

void replace_json_specals(string& input) {
    replace_str(input, "\\", "BACKSLASHREPLACEMENTNOONEISGONNAUSEIT");
    replace_str(input, "\"", "DOUBLEQUOTEREPLACEMENTNOONEISGONNAUSE");
    replace_str(input, "BACKSLASHREPLACEMENTNOONEISGONNAUSEIT", "\\\\");
    replace_str(input, "DOUBLEQUOTEREPLACEMENTNOONEISGONNAUSE", "\\\"");
    stripUnicode(input);
}

bool GetOBSid(HWND hwnd, string& str, bool gameMode) {
    string full_exe, title, className, productName;
    HMONITOR monitor;

    if (!GetExe(hwnd, full_exe, true))
        return false;

    fs::path p(full_exe);
    string exe = p.filename().string();


    if (isMicrosoftInternalExe(exe.data()))
        return false;

    if (exe.compare("obs64.exe") == 0)
        return false;


    if (gameMode && isBlacklistedWindow(exe.data())) {
        return false;
    }

    GetTitle(hwnd , title);
    GetWindowClass(hwnd, className);
    bool productNameRes = GetProductNameFromExe(full_exe, productName);
    bool monitorRes = HWNDToMonitor(hwnd, monitor);
    bool intersects = InterceptsWithMultipleMonitors(hwnd);

    DWORD pid[MAX_PATH];
    GetWindowThreadProcessId(hwnd, pid);
    string str_pid = ConvertToString(*pid);


    replace_json_specals(className);
    replace_json_specals(full_exe);
    replace_json_specals(exe);
    replace_json_specals(title);
    replace_json_specals(productName);


    string final_product_name = "null";
    if (productNameRes) {
        final_product_name = "\"" + productName + "\"";
    }

    string final_monitor = "null";
    if (monitorRes) {
        int width, height;
        if (GetMonitorDimensions(monitor, width, height)) {
            final_monitor = std::format("{{\"width\": {}, \"height\": {}}}", width, height);
        }
    }

    string final_intersects = "false";
    if (intersects) {
        final_intersects = "true";
    }

    string hwnd_str = to_string((int)hwnd);

    str = std::format("{{\"className\": \"{}\", \"executable\": \"{}\", \"title\": \"{}\", \"pid\": {}, \"productName\": {}, \"hwnd\": {}, \"full_exe\": \"{}\", \"monitorDimensions\": {}, \"intersectsMultiple\": {} }}", className, exe, title, str_pid, final_product_name, hwnd_str, full_exe, final_monitor, intersects);
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

        if (firstArg.compare("pid") != 0) {
        }
        else {
            if (argc >= 3) {
                string pidArgument(argv[2]);

                int pid = stoi(pidArgument);
                vector<HWND> hwndList;

                GetAllWindowsFromProcessID(pid, hwndList);
                if (hwndList.size() <= 0) {
                    cerr << "Could not find any handles";
                    exit(-1);
                }

                for (HWND currHandle : hwndList) // access by reference to avoid copying
                {
                    string exe;
                    boolean shouldExit = GetExe(currHandle, exe, true);
                    if(!shouldExit){}
                    else {
                        cout << exe;
                        exit(0);
                    }
                }

                cerr << "Could not find any executable from handles";
                exit(-1);
            }
            else {
                cerr << "after argument pid, a pid has to be given";
                exit(-1);
            }
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
