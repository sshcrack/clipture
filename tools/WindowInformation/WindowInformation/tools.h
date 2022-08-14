#pragma once
enum ShellIconSize {
    SmallIcon = 0x100 | 0x1,
    LargeIcon = 0x100 | 0x0
};

extern int chartoint(char s[]);
extern int everydigit(char s[]);
extern const char* GetIconForFile(const char* filename, ShellIconSize size, std::filesystem::path icoFile);
