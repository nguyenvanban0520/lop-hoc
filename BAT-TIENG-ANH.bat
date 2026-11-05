@echo off
cd /d "%~dp0"
if not exist node_modules call npm ci
start "" http://localhost:3007
call npm run dev:english
pause
