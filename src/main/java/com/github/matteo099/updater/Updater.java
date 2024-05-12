package com.github.matteo099.updater;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.regex.Pattern;
import java.util.stream.Stream;

import com.github.matteo099.utils.FileUtils;
import com.github.matteo099.utils.LoggerUtil;

public class Updater {

    private static String fileName;

    public static boolean isTempApplication() {
        String currentDir = Paths.get("").toAbsolutePath().toString();
        LoggerUtil.instance.info("Current absolute path is: " + currentDir);

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
                LoggerUtil.instance.info("Another quarkus application is running, stopping it!");
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

    private static void stopRunningQuarkusApp() throws IOException, InterruptedException {
        ProcessBuilder killProcessBuilder = null;

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
                            LoggerUtil.instance.info("Stopping application on port 8080 with pid=" + pid);
                            // Kill the process
                            killProcessBuilder = new ProcessBuilder("taskkill", "/F", "/PID", pid);
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
                    killProcessBuilder = new ProcessBuilder("kill", "-9", pid.trim());
                }
            }
        }

        if (killProcessBuilder != null) {
            var p = killProcessBuilder.start();
            LoggerUtil.instance.info("Stopping app...");
            var retCode = p.waitFor();
            LoggerUtil.instance.info("Stopping app, ret code=" + retCode);
        } else {
            LoggerUtil.instance.info("Unable to stop application... no app found on port 8080; maybe is already dead!");
        }
    }

    // TODO: create a backup folder!
    private static void copyTempFileToMainDirectory() throws IOException {
        LoggerUtil.instance.info("Comping temp file to parent directory");

        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path parentDirectory = currentDirectory.getParent();

        LoggerUtil.instance.info("Comping temp file to parent directory: " + parentDirectory.toString());

        String extension = isWindows() ? ".exe" : ".jar";

        Files.walkFileTree(currentDirectory, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                if (file.toString().toLowerCase().endsWith(extension)) {
                    Path target = parentDirectory.resolve(file.getFileName());
                    Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                    LoggerUtil.instance.info("File copied to parent directory: " + target);
                    fileName = target.getFileName().toString();
                    LoggerUtil.instance.info(fileName);
                    return FileVisitResult.TERMINATE;
                }
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static void startOtherApp() throws IOException, InterruptedException {
        LoggerUtil.instance.info("Starting updated app");

        Path executablePath = Paths.get("").toAbsolutePath().getParent();
        if (isWindows()) {
            if(fileName != null){
                LoggerUtil.instance.info("Starting newest application: " + fileName);
                executeCommand(fileName, executablePath);
            }

            // find files matched `exe` file extension from folder
            // try (Stream<Path> walk = Files.walk(executablePath)) {
            // var result = walk
            // .filter(p -> !Files.isDirectory(p)) // not a directory
            // .map(p -> p.toString().toLowerCase()) // convert path to string
            // .filter(f -> f.endsWith("exe")) // check end with
            // .findFirst(); // collect all matched to a List
            // if (result.isPresent()) {
            // LoggerUtil.instance.info("Starting newest application at: " + result.get());
            // executeCommand(result.get(), executablePath);
            // }
            // }

        } else {
            // find files matched `jar` file extension from folder
            try (Stream<Path> walk = Files.walk(executablePath)) {
                var result = walk
                        .filter(p -> !Files.isDirectory(p)) // not a directory
                        .map(p -> p.toString().toLowerCase()) // convert path to string
                        .filter(f -> f.endsWith("jar")) // check end with
                        .findFirst(); // collect all matched to a List
                if (result.isPresent()) {
                    LoggerUtil.instance.info("Starting newest application at: " + result.get());
                    executeCommand("java -jar " + result.get(), executablePath);
                }
            }

        }
    }

    private static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("windows");
    }

    private static void stopThisApp() {
        LoggerUtil.instance.info("Stopping updater app");
        System.exit(0);
    }

    public static void cleanDirectory() {
        // Delete the directory
        Path tempDir = Paths.get("tmp");
        try {
            LoggerUtil.instance.info("Removing update folder");
            FileUtils.deleteDirectory(tempDir);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void executeCommand(String command, Path pwd) throws IOException, InterruptedException {
        try {
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            // Set the working directory if needed
            if (pwd != null)
                processBuilder.directory(new File(pwd.toString()));

            // Start the process
            Process process = processBuilder.start();
            LoggerUtil.instance.info("Process started with pid: " + process.pid());

            // Print a message to indicate that the process has started
            LoggerUtil.instance.info("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
