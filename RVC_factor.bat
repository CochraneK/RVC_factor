@echo off
title RVC Voice Studio
cd /d "%~dp0"

if exist ".venv\Scripts\python.exe" (
    set "PYTHON=.venv\Scripts\python.exe"
) else (
    set "PYTHON=python"
)

REM Open the browser, then start the Flask server in this window.
start "" http://127.0.0.1:5000
"%PYTHON%" app.py

pause
