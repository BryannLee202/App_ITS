' Khoi dong EcoGo Smart hoan toan an 100% khong hien bat ky cua so nao
Set WshShell = CreateObject("WScript.Shell")
strDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strDir & "\scripts\start-live.ps1""", 0, False
