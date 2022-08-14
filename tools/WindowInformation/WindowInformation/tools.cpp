#include <thread>
#include <ctype.h>
#include <windows.h>
#include <shellapi.h>
#include <filesystem>
#include "tools.h"
#include <iostream>     // std::cout
#include <fstream>      // std::ifstream
#include <olectl.h>
#include <time.h>
#include <ctime>
#include <chrono>
#pragma comment(lib, "oleaut32.lib")

using std::cout; using std::endl;
using std::chrono::duration_cast;
using std::chrono::milliseconds;
using std::chrono::system_clock;

using namespace std;
extern int chartoint(char s[])
{

    int i, n;
    n = 0;
    for (i = 0; isdigit(s[i]); ++i)
    {
        n = 10 * n + (s[i] - '0');
    }

    return n;
}

extern int everydigit(char s[])
{
    int length = sizeof(s) / sizeof(s[0]);
    for (int i = 0; i < length; i++)
    {
        int asciiCode = (int)s[i];
        if (asciiCode == 0)
            break;

        if (isdigit(s[i]))
        {
        }
        else
        {
            return 0;
        }
    }

    return 1;
}

extern HICON GetHICON(const char* filenameChar, ShellIconSize size) {
    string filenameStr = string(filenameChar);
    wstring convert(filenameStr.begin(), filenameStr.end());
    LPCWSTR filename = convert.c_str();
    SHFILEINFO shinfo;

    SHGetFileInfo(filename, 0, &shinfo, sizeof(shinfo), size);

    return shinfo.hIcon;
}


HRESULT SaveIcon(HICON hIcon, const wchar_t* path) {
    // Create the IPicture intrface
    PICTDESC desc = { sizeof(PICTDESC) };
    desc.picType = PICTYPE_ICON;
    desc.icon.hicon = hIcon;
    IPicture* pPicture = 0;
    HRESULT hr = OleCreatePictureIndirect(&desc, IID_IPicture, FALSE, (void**)&pPicture);
    if (FAILED(hr)) return hr;

    // Create a stream and save the image
    IStream* pStream = 0;
    CreateStreamOnHGlobal(0, TRUE, &pStream);
    LONG cbSize = 0;
    hr = pPicture->SaveAsFile(pStream, TRUE, &cbSize);

    // Write the stream content to the file
    if (!FAILED(hr)) {
        HGLOBAL hBuf = 0;
        GetHGlobalFromStream(pStream, &hBuf);
        void* buffer = GlobalLock(hBuf);
        HANDLE hFile = CreateFile(path, GENERIC_WRITE, 0, 0, CREATE_ALWAYS, 0, 0);
        if (!hFile) hr = HRESULT_FROM_WIN32(GetLastError());
        else {
            DWORD written = 0;
            WriteFile(hFile, buffer, cbSize, &written, 0);
            CloseHandle(hFile);
        }
        GlobalUnlock(buffer);
    }
    // Cleanup
    pStream->Release();
    pPicture->Release();
    return hr;

}

extern const char* GetIconForFile(const char* filenameChar, ShellIconSize icoSize, std::filesystem::path icoFile)
{
    HICON icon = GetHICON(filenameChar, icoSize);

    std::wstring icoFileWStr = icoFile.wstring();
    const WCHAR* icoFileWChar = icoFileWStr.c_str();

    HRESULT res = SaveIcon(icon, icoFileWChar);
    if(FAILED(res)) {
        return NULL;
    }

    return icoFile.string().c_str();
}