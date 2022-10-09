#pragma once

enum SizeType {
	LARGE,
	SMALL
};

extern boolean extractIcon(const wchar_t path[4096], SizeType type, const char* iconPath);