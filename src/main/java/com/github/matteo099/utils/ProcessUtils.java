package com.github.matteo099.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.function.Consumer;

public class ProcessUtils {

    private static Consumer<String> infoLogger = LoggerUtils.instance::info;

    public static void setInfoLogger(Consumer<String> infoLogger) {
        ProcessUtils.infoLogger = infoLogger;
    }

    public static void executeCommand(String command, Path pwd) throws IOException, InterruptedException {
        try {
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            infoLogger.accept(
                    "Executing command=" + command + ", pwd=" + (pwd == null ? null : pwd.toAbsolutePath().toString()));

            // Set the working directory if needed
            if (pwd != null)
                processBuilder.directory(new File(pwd.toAbsolutePath().toString()));

            // Start the process
            Process process = processBuilder.start();
            infoLogger.accept("Process started with pid: " + process.pid());

            // Print a message to indicate that the process has started
            infoLogger.accept("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("windows");
    }
}
