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

    @Inject
    AppLifecycleBean appLifecycleBean;

    @ConfigProperty(name = "quarkus.application.version")
    String version;

    @ConfigProperty(name = "github.repo.owner")
    String repoOwner;

    @ConfigProperty(name = "github.repo.name")
    String repoName;

    // download application
    // save in a temp folder
    // start the temp application
    public void update() throws Exception {
        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name();

        if (!latestVersion.equals(version)) {
            downloadAndInstallRelease(latestRelease);
            startTempApplication();
            appLifecycleBean.forceStopApplication(1500L);
        }
    }

    private void downloadAndInstallRelease(Release release) throws Exception {
        String tmpPath = "./tmp";
        for (Asset asset : release.getAssets()) {
            asset.download(tmpPath);
            Path location = null;
            if (asset.getName().startsWith("duerre-manager")) {
                // location = Paths.get(jarDirectoryPath);
            } else if (asset.getName().startsWith("dist")) {
                // location = Paths.get(nginxHtmlDirectoryPath);
            }

            if (location != null) {
                Files.deleteIfExists(location);
                asset.unzip(location);
            }
        }
    }

    private void startTempApplication() throws IOException, InterruptedException {
        String version = "1.0.0";
        executeCommand("start ./tmp/duerre-manager-" + version + "-runner.exe");
    }

    private void executeCommand(String command) throws IOException, InterruptedException {
        try {
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            // Set the working directory if needed
            // processBuilder.directory(new File("path/to/working/directory"));

            // Start the process
            Process process = processBuilder.start();

            // Print a message to indicate that the process has started
            System.out.println("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
