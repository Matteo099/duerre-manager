package com.github.matteo099.updater;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UpdaterService {

    @Inject
    @RestClient
    GithubService gitHubService;

    @ConfigProperty(name = "application.jar-directory.path")
    String jarDirectoryPath;

    @ConfigProperty(name = "application.nginx-directory.path")
    String nginxHtmlDirectoryPath;

    @ConfigProperty(name = "application.version.path")
    String currentVersionFilePath;

    @ConfigProperty(name = "github.repo.owner")
    String repoOwner;

    @ConfigProperty(name = "github.repo.name")
    String repoName;

    @ConfigProperty(name = "services.duerre-manager.name")
    String duerreManagerService;

    @ConfigProperty(name = "services.nginx.name")
    String nginxService;

    public String update() throws Exception {
        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name();

        if (!latestVersion.equals(this.getCurrentVersion())) {
            stopServices();
            downloadAndInstallRelease(latestRelease);
            updateTextVersion(latestVersion);
            startServices();
            return "Updated to version " + latestVersion;
        }

        return "Already up to date";
    }
    
    private void stopServices() throws IOException, InterruptedException {
        executeCommand("sc stop " + duerreManagerService);
        executeCommand("sc stop " + nginxService);
    }

    private void startServices() throws IOException, InterruptedException {
        executeCommand("sc start " + nginxService);
        executeCommand("sc start " + duerreManagerService);
    }

    private void executeCommand(String command) throws IOException, InterruptedException {
        Process process = Runtime.getRuntime().exec(command);
        process.waitFor();
    }

    private String getCurrentVersion() {
        try {
            return Files.readString(Paths.get(currentVersionFilePath));
        } catch (IOException e) {
            return "v0.0.0";
        }
    }

    private void updateTextVersion(String latestVersion) {
        try {
            Files.writeString(Paths.get(currentVersionFilePath), latestVersion);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void downloadAndInstallRelease(Release release) throws Exception {
        String tmpPath = "./tmp";
        for (Asset asset : release.getAssets()) {
            asset.download(tmpPath);
            Path location = null;
            if (asset.getName().startsWith("duerre-manager")) {
                location = Paths.get(jarDirectoryPath);
            } else if (asset.getName().startsWith("dist")) {
                location = Paths.get(nginxHtmlDirectoryPath);
            }

            if (location != null) {
                Files.deleteIfExists(location);
                asset.unzip(location);
            }
        }
    }

    /*
     * private void test() {
     * // Move jar file to desired location
     * Files.move(Paths.get(jarFileName), Paths.get("duerre_manager/" +
     * jarFileName),
     * StandardCopyOption.REPLACE_EXISTING);
     * 
     * // Move extracted website to nginx html folder
     * Path htmlFolder = Paths.get("/usr/share/nginx/html");
     * File[] files = htmlFolder.toFile().listFiles();
     * if (files != null) {
     * for (File file : files) {
     * if (file.isDirectory()) {
     * deleteDirectory(file);
     * } else {
     * Files.deleteIfExists(file.toPath());
     * }
     * }
     * }
     * }
     * 
     * private void deleteDirectory(File directory) {
     * File[] files = directory.listFiles();
     * if (files != null) {
     * for (File file : files) {
     * if (file.isDirectory()) {
     * deleteDirectory(file);
     * } else {
     * file.delete();
     * }
     * }
     * }
     * directory.delete();
     * }
     */
}
