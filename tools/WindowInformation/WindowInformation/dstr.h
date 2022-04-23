#pragma once
#include <string>

using namespace std;

extern int astrcmpi(const char* str1, const char* str2);
extern int astrcmp_n(const char* str1, const char* str2, size_t n);
extern int astrcmpi_n(const char* str1, const char* str2, size_t n);
extern void replace_str(string& input, string from, string to);
extern string ConvertToString(DWORD value);
extern void replace_json_specals(string& input);