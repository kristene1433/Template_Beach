@echo off
echo Starting Palm Run LLC Development Environment...
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies
    pause
    exit /b 1
)

echo Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo Dependencies installed successfully!
echo.
echo Starting development servers...
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

call npm run dev

pause
