' Khởi động EcoGo Smart hoàn toàn ngầm không hiện cửa sổ terminal
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\Chay_He_Thong_Live.bat"" min", 0, False
