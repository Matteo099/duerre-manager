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
import java.util.LinkedList;
import java.util.List;
import java.util.regex.Pattern;

import com.github.matteo099.utils.FileUtils;
import com.github.matteo099.utils.LoggerUtils;
import com.github.matteo099.utils.ProcessUtils;

public class Updater {

    public static final String UPDATE_DIRECTORY = "tmp";
    public static final String BACKUP_DIRECTORY = "backup";
    public static final String APP_NAME = "duerre-manager-runner";
    public static final int QUARKUS_PORT = 8079;
    public static final int MAX_TRY_NUMBER = 10;
    public static final int MS_SLEEP_BETWEEN_TRIES = 1000;

    private static String fileName;
    private static boolean backupDone = false;

    public static boolean isTempApplication() {
        String currentDir = Paths.get("").toAbsolutePath().toString();
        LoggerUtils.instance.info("Current absolute path is: " + currentDir);

        // Split the current directory path by the file separator
        String[] dirs = currentDir.split(Pattern.quote(File.separator));

        // Check if the last directory is equal to "tmp"
        return dirs[dirs.length - 1].equals(UPDATE_DIRECTORY);
    }

    /**
     * 1. Check for running quakus application (listen for app on port QUARKUS_PORT)
     * excluding myself
     * 2. copy the temp file in the main directory, overwrite the files
     * 3. start the other app
     * 4. stop this app
     */
    public static void start() {
        int tryNumber = 0;
        try {
            // Step 1: Check for running Quarkus application (excluding myself)
            while (isQuarkusRunning()) {
                if (tryNumber >= MAX_TRY_NUMBER)
                    throw new Exception("Maximum try to stop quarkus app reached (" + MAX_TRY_NUMBER + ")");
                LoggerUtils.instance
                        .info("Another quarkus application is running, try stopping it! (try number " + tryNumber + "/"
                                + MAX_TRY_NUMBER + ")");
                // stop the quarkus running process
                stopRunningQuarkusApp();
                tryNumber++;
                LoggerUtils.instance
                        .info("Sleeping " + MS_SLEEP_BETWEEN_TRIES + " ms before proceeding");
                Thread.sleep(MS_SLEEP_BETWEEN_TRIES);
            }

            // Step 2: Create a backup and copy the temp files to the main directory
            deleteBackupDirectory();
            moveFilesToBackup();
            copyTempFileToMainDirectory();
            // Step 3: Start the other app
            startOtherApp();
        } catch (Exception e) {
            LoggerUtils.instance.exception(e);
            try {
                if (backupDone)
                    restoreBackup();
                startOldApp();
                LoggerUtils.instance.info("Unable to perform upgrade of application. MANUAL UPDATE REQUIRED!");
            } catch (Exception e2) {
                LoggerUtils.instance.exception(e2);
                LoggerUtils.instance.info("Unable to start application. MANUAL TROUBLESHOOTING REQUIRED!");
            }
        } finally {
            // Step 4: Stop this app
            stopThisApp();
        }
    }

    private static boolean isQuarkusRunning() throws IOException {
        boolean quarkusRunning = false;
        ServerSocket serverSocket = null;
        try {
            serverSocket = new ServerSocket(QUARKUS_PORT);
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

        if (ProcessUtils.isWindows()) {
            // Attempt to find and kill the process using port QUARKUS_PORT on Windows
            ProcessBuilder processBuilder = new ProcessBuilder("cmd.exe", "/c",
                    "netstat -aon | find \"" + QUARKUS_PORT + "\"");
            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.contains("LISTENING")) {
                        String[] parts = line.trim().split("\\s+");
                        if (parts.length >= 5) {
                            String pid = parts[4];
                            LoggerUtils.instance
                                    .info("Stopping application on port " + QUARKUS_PORT + " with pid=" + pid);
                            // Kill the process
                            killProcessBuilder = new ProcessBuilder("taskkill", "/F", "/PID", pid);
                        }
                    }
                }
            }
        } else {
            // Attempt to find and kill the process using port QUARKUS_PORT
            ProcessBuilder processBuilder = new ProcessBuilder("lsof", "-ti", ":" + QUARKUS_PORT);
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
            LoggerUtils.instance.info("Stopping app...");
            var retCode = p.waitFor();
            LoggerUtils.instance.info("Stopping app, ret code=" + retCode);
        } else {
            LoggerUtils.instance
                    .info("Unable to stop application... no app found on port " + QUARKUS_PORT
                            + "; maybe is already dead!");
        }
    }

    private static void deleteBackupDirectory() throws IOException {
        LoggerUtils.instance.info("Deleting backup directory");
        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path mainDir = currentDirectory.getParent();
        Path backupDir = mainDir.resolve(BACKUP_DIRECTORY);
        FileUtils.deleteDirectory(backupDir);
    }

    private static void moveFilesToBackup() throws IOException {
        LoggerUtils.instance.info("Copying files to backup directory...");
        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path mainDir = currentDirectory.getParent();
        Path backupDir = mainDir.resolve(BACKUP_DIRECTORY);
        Files.createDirectories(backupDir);

        LoggerUtils.instance.info("Copying files to backup directory: currentDirectory=" + currentDirectory.toString()
                + ", mainDir=" + mainDir.toString() + ", backupDir=" + backupDir.toString());

        Files.walkFileTree(mainDir, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                if (dir.equals(backupDir) || dir.endsWith(UPDATE_DIRECTORY)) {
                    return FileVisitResult.SKIP_SUBTREE;
                }
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Path target = backupDir.resolve(mainDir.relativize(file));
                Files.move(file, target, StandardCopyOption.REPLACE_EXISTING);
                LoggerUtils.instance.info("Moved file to backup directory: " + target);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                if (!dir.equals(mainDir)) {
                    Files.delete(dir);
                    LoggerUtils.instance.info("Deleted directory: " + dir);
                }
                return FileVisitResult.CONTINUE;
            }
        });

        backupDone = true;
    }

    private static void copyTempFileToMainDirectory() throws IOException {
        LoggerUtils.instance.info("Comping temp file to parent directory...");

        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path mainDir = currentDirectory.getParent();

        LoggerUtils.instance.info("Comping temp file to parent directory: " + mainDir.toString());

        String extension = ProcessUtils.isWindows() ? ".exe" : ".jar";

        Files.walkFileTree(currentDirectory, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                if (file.toString().toLowerCase().endsWith(extension)) {
                    Path target = mainDir.resolve(file.getFileName());
                    Files.copy(file, target, StandardCopyOption.REPLACE_EXISTING);
                    LoggerUtils.instance.info("File copied to parent directory: " + target);
                    fileName = target.getFileName().toString();
                    LoggerUtils.instance.info(fileName);
                    return FileVisitResult.TERMINATE;
                }
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static void startOtherApp() throws IOException, InterruptedException {
        if (fileName != null) {
            LoggerUtils.instance.info("Starting updated app: " + fileName);
            Path executablePath = Paths.get("").toAbsolutePath().getParent();
            String app = executablePath.resolve(fileName).toAbsolutePath().toString();
            if (ProcessUtils.isWindows()) {
                ProcessUtils.executeCommand(app, executablePath);
            } else {
                ProcessUtils.executeCommand("java -jar " + app, executablePath);
            }
        } else {
            LoggerUtils.instance.info("Unable to start app becuse the fileName is null");
        }
    }

    private static void stopThisApp() {
        LoggerUtils.instance.info("Stopping updater app");
        System.exit(0);
    }

    private static void startOldApp() throws Exception {
        LoggerUtils.instance.info("Starting backup (older) app...");
        String backupFileName = getBackupFileName();
        Path executablePath = Paths.get("").toAbsolutePath().getParent();
        String app = executablePath.resolve(backupFileName).toAbsolutePath().toString();

        LoggerUtils.instance.info("Starting backup (older) app at " + app);

        if (ProcessUtils.isWindows()) {
            ProcessUtils.executeCommand(app, executablePath);
        } else {
            ProcessUtils.executeCommand("java -jar " + app, executablePath);
        }
    }

    private static void restoreBackup() throws IOException {
        LoggerUtils.instance.info("Restoring backup...");

        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path mainDir = currentDirectory.getParent();
        Path backupDir = mainDir.resolve(BACKUP_DIRECTORY);

        Files.walkFileTree(mainDir, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                if (dir.equals(backupDir) || dir.endsWith(UPDATE_DIRECTORY)) {
                    return FileVisitResult.SKIP_SUBTREE;
                }
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                if (!dir.equals(mainDir)) {
                    Files.delete(dir);
                    LoggerUtils.instance.info("Deleted: " + dir);
                }
                return FileVisitResult.CONTINUE;
            }
        });

        Files.walkFileTree(backupDir, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                Path target = backupDir.resolve(mainDir.relativize(file));
                Files.move(file, target, StandardCopyOption.REPLACE_EXISTING);
                LoggerUtils.instance.info("Restored file from backup directory: " + target);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private static String getBackupFileName() throws Exception {
        List<String> fileNameList = new LinkedList<>();
        Path currentDirectory = Paths.get("").toAbsolutePath();
        Path mainDir = currentDirectory.getParent();
        String extension = ProcessUtils.isWindows() ? ".exe" : ".jar";

        Files.walkFileTree(mainDir, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                if (dir.endsWith(UPDATE_DIRECTORY) || dir.endsWith(BACKUP_DIRECTORY)) {
                    return FileVisitResult.SKIP_SUBTREE;
                }
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                if (file.toString().toLowerCase().endsWith(extension)) {
                    fileNameList.add(file.getFileName().toString());
                    return FileVisitResult.TERMINATE;
                }
                return FileVisitResult.CONTINUE;
            }
        });

        if (fileNameList.isEmpty())
            throw new Exception("Unable to find backup application");

        var fileName = fileNameList.get(0);
        LoggerUtils.instance.info("Found backup file name: " + fileName);
        return fileName;
    }

    public static void cleanDirectory() {
        // Delete the directory
        Path tempDir = Paths.get(UPDATE_DIRECTORY);
        try {
            LoggerUtils.instance.info("Removing update folder");
            FileUtils.deleteDirectory(tempDir);
        } catch (IOException e) {
            LoggerUtils.instance.exception(e);
        }
    }

    public static String getFileName(String extension) {
        return APP_NAME + "." + extension;
    }
}
