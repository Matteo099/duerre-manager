# Duerre Manager

Duerre Manager is a management application designed to oversee the molds used in a guardoloficio (guardolo manufacturing) factory.

This application offers intelligent mold management and search capabilities, enhancing efficiency in overseeing the production process.

## Features
Key features of the application include:
- Mold dashboard for an overview of all molds.
- Advanced mold search functionality, allowing searches by name, dimensions, or even by drawing a sketch.
- Creation of molds using a specialized 2D CAD tool tailored for guardolo molds.
- Mold management capabilities, including editing, deletion, and creation.

## Building the Native Executable
To build the native executable, follow these steps:

1. Ensure Docker is running.
2. Open 'x64 Native Tools Command Prompt for VS 2022' as **administrator** (typically found at: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\VC).
3. Navigate to the project's Quarkus folder that you want to build (e.g., cd D:\Desktop\Matteo\QuarkusWorkspace\duerre-manager).
4. Run the command: `quarkus build --native`.
5. The executable will be available in the target folder (\target\duerre-manager-1.0.0.exe).

For more detailed instructions, refer to the [building native image guide](https://quarkus.io/guides/building-native-image#producing-a-native-executable).

## TODO
