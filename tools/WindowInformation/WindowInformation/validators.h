#pragma once
#include <WinUser.h>

extern enum class WindowSearchMode {
    EXCLUDE_MINIMIZED,
    INCLUDE_MINIMIZED
};
extern bool IsWindowCloaked(HWND wnd);
extern bool IsWindowValid(HWND wnd, enum WindowSearchMode mode);
extern bool isMicrosoftInternalExe(const char* exe);