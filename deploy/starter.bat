@echo off

REM Function to check if a service is running
:CheckServiceRunning
sc query state= all | find "%1"
if %errorlevel% == 0 (
    echo %1 is running.
) else (
    echo %1 is not running. Waiting...
    timeout /t 5
    goto :CheckServiceRunning
)

REM Start MongoDB
echo Starting MongoDB...
net start MongoDB

REM Check if MongoDB is running
call :CheckServiceRunning "MongoDB"

REM Start NGINX
echo Starting NGINX...
net start NGINX

REM Check if NGINX is running
call :CheckServiceRunning "NGINX"

REM Start DuerreManager
echo Starting DuerreManager...
net start DuerreManager

REM End of script
echo All services started.
pause