// WindowClassGetter.cpp : This file contains the 'main' function. Program execution begins and ends there.
//

#pragma comment (lib, "dwmapi.lib")

#include <iostream>
#include <format>
#include <windows.h>
#include <WinUser.h>
#include <string>


#include <Psapi.h>
#include <filesystem>

#include <atlstr.h>
#include <mmdeviceapi.h>
#include <Functiondiscoverykeys_devpkey.h>

#include "tools.h"
#include "dstr.h"
#include "validators.h"
#include "window.h"
#include  "game.h"

using namespace std;
namespace fs = std::filesystem;

class CCoInitialize {
private:
    HRESULT m_hr;
public:
    CCoInitialize(PVOID pReserved, HRESULT& hr)
        : m_hr(E_UNEXPECTED) {
        hr = m_hr = CoInitialize(pReserved);
    }
    ~CCoInitialize() { if (SUCCEEDED(m_hr)) { CoUninitialize(); } }
};


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
    string is_focused = IsFocused(hwnd) ? "true" : "false";

    str = std::format("{{\"className\": \"{}\", \"executable\": \"{}\", \"title\": \"{}\", \"pid\": {}, \"productName\": {}, \"hwnd\": {}, \"full_exe\": \"{}\", \"monitorDimensions\": {}, \"intersectsMultiple\": {}, \"focused\": {} }}", className, exe, title, str_pid, final_product_name, hwnd_str, full_exe, final_monitor, intersects, is_focused);
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
        if (firstArg.compare("audio") == 0) {
            HRESULT hr = S_OK;
            // initialize COM
            CCoInitialize ci(NULL, hr);
            if (FAILED(hr)) {
                cerr << "failed1" << endl;
                return __LINE__;
            }
            // get enumerator
            CComPtr<IMMDeviceEnumerator> pMMDeviceEnumerator;
            hr = pMMDeviceEnumerator.CoCreateInstance(__uuidof(MMDeviceEnumerator));
            if (FAILED(hr)) {
                cerr << "failed2" << endl;
                return __LINE__;
            }
            // get default render/capture endpoints
            CComPtr<IMMDevice> pRenderEndpoint;
            CComPtr<IMMDevice> pCaptureEndpoint;

            hr = pMMDeviceEnumerator->GetDefaultAudioEndpoint(eRender, eConsole, &pRenderEndpoint);
            hr = pMMDeviceEnumerator->GetDefaultAudioEndpoint(eCapture, eConsole, &pCaptureEndpoint);
            if (FAILED(hr)) {
                cerr << "failed3" << endl;
                return __LINE__;
            }

            if (hr != S_OK) {
                cerr << hr;
                exit(-1);
            }

            LPWSTR renderID = NULL;
            LPWSTR captureID = NULL;
            pRenderEndpoint->GetId(&renderID);
            pCaptureEndpoint->GetId(&captureID);

            printf("{\"desktop\":\"%S\",\"mic\":\"%S\"}", renderID, captureID);
            exit(0);
        }

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
