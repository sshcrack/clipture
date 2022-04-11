#pragma comment (lib, "dwmapi.lib")

#include <iostream>
#include <string>
#include <windows.h>
#include <WinUser.h>

#include "validators.h"


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


