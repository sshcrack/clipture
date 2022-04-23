#pragma once
#pragma comment (lib, "dwmapi.lib")

#include <iostream>
#include <windows.h>
#include <WinUser.h>
#include <string>
#include <Tlhelp32.h>
#include "validators.h"

extern bool IsUWPWindow(HWND hwnd);
extern HWND GetUWPActualWindow(HWND parent);
extern HWND FirstWindow(enum WindowSearchMode mode, HWND* parent,
	bool* UseFindWindowEx);
extern HWND NextWindow(HWND window, enum WindowSearchMode mode, HWND* parent,
	bool use_findwindowex);
extern void GetAllWindowsFromProcessID(DWORD dwProcessID, std::vector<HWND>& vhWnds);
extern bool GetProductNameFromExe(string full_exe, string& productName);
extern bool HWNDToMonitor(HWND hwnd, HMONITOR& monitor);
extern bool InterceptsWithMultipleMonitors(HWND hwnd);
extern bool GetMonitorDimensions(HMONITOR monitor, int& width, int& height);
extern bool IsFocused(HWND hwnd);
extern bool GetExe(HWND wnd, string& executable, bool fullPath = false);
extern void GetTitle(HWND hwnd, string& title);
extern void GetWindowClass(HWND wnd, string& className);