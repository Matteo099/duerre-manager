# Duerre Manager

Duerre Manager is a management application designed to oversee the molds used in a guardoloficio (guardolo manufacturing) factory.

This application offers intelligent mold management and search capabilities, enhancing efficiency in overseeing the production process.

## Features
Key features of the application include:
- Mold dashboard for an overview of all molds.
- Advanced mold search functionality, allowing searches by name, dimensions, or even by drawing a sketch.
- Creation of molds using a specialized 2D CAD tool tailored for guardolo molds.
- Mold management capabilities, including editing, deletion, and creation.
- Auto update (check for latest release and update by clicking a button).
- Order management

## Build

### Building the Native Executable
To build the native executable, follow these steps:

1. Ensure Docker is running.
2. Open 'x64 Native Tools Command Prompt for VS 2022' as **administrator** (typically found at: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\VC).
3. Navigate to the project's Quarkus folder that you want to build (e.g., cd D:\Desktop\Matteo\QuarkusWorkspace\duerre-manager).
4. Run the command: `quarkus build --native`.
5. The executable will be available in the target folder (\target\duerre-manager-x.x.x-runner.exe).

For more detailed instructions, refer to the [building native image guide](https://quarkus.io/guides/building-native-image#producing-a-native-executable).

### Building the fat JAR
To build the fat jar, follow these steps:

1. Ensure you have the property `quarkus.package.type=uber-jar` inside the `application.properties` file
2. Navigate to the project's Quarkus folder that you want to build (e.g., cd D:\Desktop\Matteo\QuarkusWorkspace\duerre-manager).
3. Run the command: `mvn clean package`.
4. The fat JAR will be available in the target folder (\target\duerre-manager-x.x.x-runner.jar).


## Usage

### Linux
To run the application on Linux, follow these steps:

1. Download the `duerre-manager-x.x.x-runner.jar` from latest release
2. Create a folder `duerre-manager` and inside create another folder `main`; move the .jar inside the folder `main` 
3. Create a `run.sh` script inside the `duerre-manager` directory (this script lookup for the first jar inside a directory)
``` sh
#!/bin/sh

# Directory to search for the JAR file
SEARCH_DIR=$1

# Check if a directory is provided
if [ -z "$SEARCH_DIR" ]; then
  echo "Usage: $0 <search_directory>"
  exit 1
fi

# Find the first JAR file in the specified directory (excluding subdirectories)
JAR_FILE=$(find "$SEARCH_DIR" -maxdepth 1 -name "*.jar" | head -n 1)

# Check if a JAR file is found
if [ -z "$JAR_FILE" ]; then
  echo "No JAR file found in the directory: $SEARCH_DIR"
  exit 1
fi

# Extract the directory from the JAR file path
JAR_DIR=$(dirname "$JAR_FILE")

# Change to the directory of the JAR file
cd "$JAR_DIR" || exit

# Start the JAR file
echo "Starting JAR file: $JAR_FILE"
java -jar "$(basename "$JAR_FILE")"
```

4. create a service (to start the application on server boot): `sudo nano /etc/systemd/system/duerre-manager.service`

``` sh
[Unit]
Description=Duerre Manager Service
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
WorkingDirectory=/home/server/duerre-manager
ExecStart=/home/server/duerre-manager/run.sh ./main
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=duerre-manager

[Install]
WantedBy=multi-user.target
```

5. start the service:
    - `sudo systemctl daemon-reload`
    - `sudo systemctl start duerre-manager.service`


### Windows
1. Download the `duerre-manager-x.x.x-runner.exe` from latest release
2. Create a folder `duerre-manager` and inside create another folder `main`; move the .exe inside the folder `main` 
3. Create a `run.cmd` script inside the `duerre-manager` directory (this script lookup for the first exe inside a directory)

``` bash
@echo off

REM Directory to search for the EXE file
set SEARCH_DIR=%1

REM Check if a directory is provided
if "%SEARCH_DIR%"=="" (
    echo Usage: %0 ^<search_directory^>
    exit /b 1
)

REM Find the first EXE file in the specified directory (excluding subdirectories)
for %%F in ("%SEARCH_DIR%\*.exe") do (
    set "EXE_FILE=%%F"
    goto :found
)

:found
REM Check if an EXE file is found
if "%EXE_FILE%"=="" (
    echo No EXE file found in the directory: %SEARCH_DIR%
    exit /b 1
)

REM Extract the directory from the EXE file path
set "EXE_DIR=%~dpEXE_FILE%"

REM Change to the directory of the EXE file
cd /d "%EXE_DIR%" || exit /b 1

REM Start the EXE file
echo Starting EXE file: %EXE_FILE%
"%EXE_FILE%"

```

4. create a service (to start the application on server boot): `sudo nano /etc/systemd/system/duerre-manager.service`

``` sh
[Unit]
Description=Duerre Manager Service
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
WorkingDirectory=/home/server/duerre-manager
ExecStart=/home/server/duerre-manager/run.sh ./main
Restart=always
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=duerre-manager

[Install]
WantedBy=multi-user.target
```

5. start the service:
    - `sudo systemctl daemon-reload`
    - `sudo systemctl start duerre-manager.service`

## TODO
- Dashboard with monitor about total orders, molds, timing...