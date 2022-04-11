#pragma comment (lib, "dwmapi.lib")

#include <string>
#include <iostream>
#include <windows.h>
#include <WinUser.h>
#include <dwmapi.h>
#include <Psapi.h>

#include "validators.h"
#include "dstr.h"


extern bool IsWindowCloaked(HWND wnd)
{
    DWORD cloaked;
    HRESULT hr = DwmGetWindowAttribute(wnd, DWMWA_CLOAKED, &cloaked,
        sizeof(cloaked));
    return SUCCEEDED(hr) && cloaked;
}


extern bool IsWindowValid(HWND wnd, enum class WindowSearchMode mode) {
    RECT rect;
    DWORD styles, ex_styles;

    if (!IsWindowVisible(wnd) ||
        (mode == WindowSearchMode::EXCLUDE_MINIMIZED &&
            (IsIconic(wnd) || IsWindowCloaked(wnd))))
        return false;

    GetClientRect(wnd, &rect);
    styles = (DWORD)GetWindowLongPtr(wnd, GWL_STYLE);
    ex_styles = (DWORD)GetWindowLongPtr(wnd, GWL_EXSTYLE);

    if (ex_styles & WS_EX_TOOLWINDOW)
        return false;
    if (styles & WS_CHILD)
        return false;
    if (mode == WindowSearchMode::EXCLUDE_MINIMIZED && (rect.bottom == 0 || rect.right == 0))
        return false;

    return true;
}


const char* InternalMicrosoftExesExact[] = {
    "startmenuexperiencehost.exe",
    "applicationframehost.exe",
    "peopleexperiencehost.exe",
    "shellexperiencehost.exe",
    "microsoft.notes.exe",
    "systemsettings.exe",
    "textinputhost.exe",
    "searchapp.exe",
    "video.ui.exe",
    "searchui.exe",
    "lockapp.exe",
    "cortana.exe",
    "gamebar.exe",
    "tabtip.exe",
    "time.exe",
    NULL,
};

const char* InternalMicrosoftExesPartial[] = {
    "windowsinternal",
    NULL,
};

extern bool isMicrosoftInternalExe(const char* exe)
{
    if (!exe)
        return false;

    for (const char** vals = InternalMicrosoftExesExact; *vals; vals++) {
        if (astrcmpi(exe, *vals) == 0)
            return true;
    }

    for (const char** vals = InternalMicrosoftExesPartial; *vals;
        vals++) {
        if (astrcmpi_n(exe, *vals, strlen(*vals)) == 0)
            return true;
    }

    return false;
}
