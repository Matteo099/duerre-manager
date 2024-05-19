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
An example could be found inside in the repository in the [linux deploy folder](https://github.com/Matteo099/duerre-manager/tree/main/deploy/linux). 

**N.B.** the jar is a placeholder (0 byte)!

To run the application on Linux, follow these steps:

1. Download the `duerre-manager-runner.jar` from latest release
2. Create a folder `duerre-manager` and move the .jar inside the folder
3. Create a service (to start the application on server boot): `sudo nano /etc/systemd/system/duerre-manager.service` (update the path!)

``` sh
[Unit]
Description=Duerre Manager Service
After=network.target mongod.service
Requires=mongod.service

[Service]
Type=simple
WorkingDirectory=/home/server/duerre-manager
ExecStart=/bin/java -jar /home/server/duerre-manager/duerre-manager-runner.jar
Restart=no
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
An example could be found inside in the repository in the [windows deploy folder](https://github.com/Matteo099/duerre-manager/tree/main/deploy/windows).

**N.B.** the exe is a placeholder (0 byte)!

1. Download the `duerre-manager-runner.exe` from latest release

2. Create the folders `duerre-manager` and `main` and move the .exe inside the **main** folder

3. Download [nssm](https://nssm.cc/download) and move `nssm.exe` in the  `duerre-manager` directory

4. Create the Service with NSSM:
    - Open a Command Prompt with administrative privileges.
    - Run the following command to create the service using NSSM:

    ``` shell
    D:\Desktop\duerre-manager\nssm.exe install DuerreManager
    ```

5. Configure the Service 
    - Application Path: Point to your `duerre-manager-runner.exe` file.
    - Startup Directory: Set this to the directory containing your executable (e.g., `D:\Desktop\duerre-manager\main`).
    - Exit Actions: set restart to Nothing (compatible srvany)

6. (Optional) Start the service:
    - open services, find `DuerreManager` and start it.

## TODO
- Dashboard with monitor about total orders, molds, timing...