package com.github.matteo099.utils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public class ProcessUtils {
    public static void executeCommand(String command, Path pwd) throws IOException, InterruptedException {
        try {
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            // Set the working directory if needed
            if (pwd != null)
                processBuilder.directory(new File(pwd.toString()));

            // Start the process
            Process process = processBuilder.start();
            LoggerUtils.instance.info("Process started with pid: " + process.pid());

            // Print a message to indicate that the process has started
            LoggerUtils.instance.info("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static boolean isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("windows");
    }
}
