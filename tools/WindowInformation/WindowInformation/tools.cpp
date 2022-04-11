#include <thread>
#include <ctype.h>
#include "tools.h"

using namespace std;


extern int chartoint(char s[])
{

    int i, n;
    n = 0;
    for (i = 0; isdigit(s[i]); ++i) {
        n = 10 * n + (s[i] - '0');
    }

    return n;
}

extern int everydigit(char s[]) {
    int length = sizeof(s) / sizeof(s[0]);
    for (int i = 0; i < length; i++) {
        int asciiCode = (int)s[i];
        if (asciiCode == 0)
            break;

        if (isdigit(s[i])) {}
        else { return 0; }
    }

    return 1;
}