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