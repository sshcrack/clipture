#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <windows.h>
#include <WinUser.h>

const char* astrblank = "";
const wchar_t* wstrblank = L"";

using namespace std;

extern int astrcmpi(const char* str1, const char* str2)
{
	if (!str1)
		str1 = astrblank;
	if (!str2)
		str2 = astrblank;

	do {
		char ch1 = (char)toupper(*str1);
		char ch2 = (char)toupper(*str2);

		if (ch1 < ch2)
			return -1;
		else if (ch1 > ch2)
			return 1;
	} while (*str1++ && *str2++);

	return 0;
}


extern int astrcmp_n(const char* str1, const char* str2, size_t n)
{
	if (!n)
		return 0;
	if (!str1)
		str1 = astrblank;
	if (!str2)
		str2 = astrblank;

	do {
		char ch1 = *str1;
		char ch2 = *str2;

		if (ch1 < ch2)
			return -1;
		else if (ch1 > ch2)
			return 1;
	} while (*str1++ && *str2++ && --n);

	return 0;
}

extern int astrcmpi_n(const char* str1, const char* str2, size_t n)
{
	if (!n)
		return 0;
	if (!str1)
		str1 = astrblank;
	if (!str2)
		str2 = astrblank;

	do {
		char ch1 = (char)toupper(*str1);
		char ch2 = (char)toupper(*str2);

		if (ch1 < ch2)
			return -1;
		else if (ch1 > ch2)
			return 1;
	} while (*str1++ && *str2++ && --n);

	return 0;
}

extern void replace_str(string& input, string from, string to)
{
	auto pos = 0;
	while (true)
	{
		size_t startPosition = input.find(from, pos);
		if (startPosition == string::npos)
			return;

		input.replace(startPosition, from.length(), to);
		pos += to.length();
	}
}

extern string ConvertToString(DWORD value)
{
	return to_string(value);
}


bool invalidChar(char c)
{
	return  (c >= 0 && c <= 31) || c == 127;
}
void stripUnicode(string& str)
{
	str.erase(remove_if(str.begin(), str.end(), invalidChar), str.end());
}

extern string join_vector(vector<string> const& strings, string delim)
{
	if (strings.empty()) {
		return std::string();
	}

	return std::accumulate(strings.begin() + 1, strings.end(), strings[0],
		[&delim](std::string x, std::string y) {
			return x + delim + y;
		}
	);
}

extern void replace_json_specials(string& input)
{
	replace_str(input, "\\", "BACKSLASHREPLACEMENTNOONEISGONNAUSEIT");
	replace_str(input, "\"", "DOUBLEQUOTEREPLACEMENTNOONEISGONNAUSE");
	replace_str(input, "BACKSLASHREPLACEMENTNOONEISGONNAUSEIT", "\\\\");
	replace_str(input, "DOUBLEQUOTEREPLACEMENTNOONEISGONNAUSE", "\\\"");
	stripUnicode(input);
}