
#include <iostream>
#include <algorithm>
#include <windows.h>
#include <WinUser.h>
#include "dstr.h"

using namespace std;
const char* blacklistedExes[] = {
	"explorer",
	"steam",
	"battle.net",
	"galaxyclient",
	"skype",
	"uplay",
	"origin",
	"devenv",
	"taskmgr",
	"chrome",
	"discord",
	"firefox",
	"systemsettings",
	"applicationframehost",
	"cmd",
	"shellexperiencehost",
	"winstore.app",
	"searchui",
	"lockapp",
	"windowsinternal.composableshell.experiences.textinput.inputapp",
	NULL,
};


extern bool isBlacklistedWindow(const char* exe)
{
	string str(exe);

	if (!exe)
		return false;

	for (const char** vals = blacklistedExes; *vals; vals++) {
		string val_str(*vals);

		for_each(str.begin(), str.end(), [](char& c) {
			c = ::tolower(c);
			});

		replace_str(str, ".exe", "");
		if (str.compare(val_str) == 0)
			return true;
	}

	return false;
}
