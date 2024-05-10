package com.github.matteo099.updater;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import com.github.matteo099.utils.FileUtils;

public class Updater {

    public static boolean isTempApplication() {
        String currentDir = Paths.get("").toAbsolutePath().toString();
        System.out.println("Current absolute path is: " + currentDir);

        // Split the current directory path by the file separator
        String[] dirs = currentDir.split(Pattern.quote(File.separator));

        // Check if the last directory is equal to "tmp"
        return dirs[dirs.length - 1].equals("tmp");
    }

    /**
     * 1. Check for running quakus application (listen for app on port 8080)
     * excluding myself
     * 2. copy the temp file in the main directory, overwrite the files
     * 3. start the other app
     * 4. stop this app
     */
    public static void start() {
        try {
            // Step 1: Check for running Quarkus application (excluding myself)
            if (isQuarkusRunning()) {
                // stop the quarkus running process
                stopRunningQuarkusApp();
            }

            // Step 2: Copy the temp file to the main directory and overwrite the files
            copyTempFileToMainDirectory();
            // Step 3: Start the other app
            startOtherApp();
            // Step 4: Stop this app
            stopThisApp();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static boolean isQuarkusRunning() throws IOException {
        boolean quarkusRunning = false;
        ServerSocket serverSocket = null;
        try {
            serverSocket = new ServerSocket(8080);
        } catch (IOException e) {
            quarkusRunning = true; // Port is already in use, Quarkus is running
        } finally {
            if (serverSocket != null) {
                serverSocket.close();
            }
        }
        return quarkusRunning;
    }

    private static void stopRunningQuarkusApp() throws IOException {
        if (System.getProperty("os.name").toLowerCase().contains("windows")) {
            // Attempt to find and kill the process using port 8080 on Windows
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c", "netstat -aon | find \"8080\"");
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains("LISTENING")) {
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length >= 5) {
                            String pid = parts[4];
                            // Kill the process
                            ProcessBuilder killProcessBuilder = new ProcessBuilder("taskkill", "/F", "/PID", pid);
                            killProcessBuilder.start();
                        }
                    }
                }
            }
        } else {
            // Attempt to find and kill the process using port 8080
            ProcessBuilder processBuilder = new ProcessBuilder("lsof", "-ti", ":8080");
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String pid = reader.readLine();
                if (pid != null && !pid.isEmpty()) {
                    // Kill the process
                    ProcessBuilder killProcessBuilder = new ProcessBuilder("kill", "-9", pid.trim());
                    killProcessBuilder.start();
                }
            }
        }
    }

    private static void copyTempFileToMainDirectory() throws IOException {
        Path currentDirectory = Paths.get("");
        Path parentDirectory = currentDirectory.getParent();
        // Iterate over the files and directories in the current directory
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(currentDirectory)) {
            for (Path entry : stream) {
                // Copy each file or directory to the parent directory
                Path destination = parentDirectory.resolve(entry.getFileName());
                Files.copy(entry, destination, StandardCopyOption.REPLACE_EXISTING);
            }
        }
    }

    private static void startOtherApp() throws IOException, InterruptedException {
        Path executablePath = Paths.get("").getParent();
        if (System.getProperty("os.name").toLowerCase().contains("windows")) {

            // find files matched `png` file extension from folder C:\\test
            try (Stream<Path> walk = Files.walk(executablePath)) {
                var result = walk
                        .filter(p -> !Files.isDirectory(p)) // not a directory
                        .map(p -> p.toString().toLowerCase()) // convert path to string
                        .filter(f -> f.endsWith("exe")) // check end with
                        .findFirst(); // collect all matched to a List
                if (result.isPresent()) {
                    System.out.println("Starting newest application at: " + result.get());
                    executeCommand(result.get());
                }
            }

        } else {
            executeCommand("java -jar " + executablePath.toString());
        }
    }

    private static void stopThisApp() {
        System.exit(0);
    }

    public static void cleanDirectory() {
        // Delete the directory
        Path tempDir = Paths.get("tmp");
        try {
            System.out.println("Removing update folder");
            FileUtils.deleteDirectory(tempDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void executeCommand(String command) throws IOException, InterruptedException {
        try {
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            // Set the working directory if needed
            // processBuilder.directory(new File("path/to/working/directory"));

            // Start the process
            Process process = processBuilder.start();
            System.out.println("Process started with pid: " + process.pid());

            // Print a message to indicate that the process has started
            System.out.println("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
