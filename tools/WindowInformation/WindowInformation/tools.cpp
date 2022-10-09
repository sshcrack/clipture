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
