@echo off

REM Define paths to your executables
set "mongod_path=.\mongo.bat"
set "nginx_path=.\nginx.exe"
set "duerre_manager_path=.\duerre-manager.bat"
set "starter_path=.\starter.exe"

REM Create MongoDB service
sc create MongoDB binPath= "%mongod_path%"
sc description MongoDB "MongoDB Service"

REM Create NGINX service
sc create NGINX binPath= "%nginx_path%"
sc description NGINX "NGINX Service"

REM Create DuerreManager service
sc create DuerreManager binPath= "%duerre_manager_path%"
sc description DuerreManager "Duerre Manager Service"

REM Create DuerreManagerStarter service
sc create DuerreManagerStarter binPath= "%starter_path%"
sc description DuerreManagerStarter "Duerre Manager Starter Service"

echo Services installed successfully.
pause