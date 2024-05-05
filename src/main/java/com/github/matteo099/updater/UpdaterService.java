package com.github.matteo099.updater;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import com.github.matteo099.utils.FileUtils;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class UpdaterService {

    @Inject
    @RestClient
    GithubService gitHubService;

    @Inject
    AppLifecycleBean appLifecycleBean;

    @ConfigProperty(name = "quarkus.application.version", defaultValue = "1.0.0")
    String version;

    @ConfigProperty(name = "github.repo.owner")
    String repoOwner;

    @ConfigProperty(name = "github.repo.name")
    String repoName;

    private String os = System.getProperty("os.name");
    private Boolean isWindows = os.toLowerCase().contains("windows");
    private boolean updateInProgress = false;

    // download application
    // save in a temp folder
    // start the temp application
    public boolean update(boolean skipDownload) throws Exception {
        if(updateInProgress) return false;

        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name().replace("v", "");

        if (!latestVersion.equals(version) || true) {
            updateInProgress = true;

            if(skipDownload) downloadAndSaveToTemp(latestRelease);
            startTempApplication(latestVersion);
            appLifecycleBean.forceStopApplication(1500L);
        }

        updateInProgress = false;
        return true;
    }

    private void downloadAndSaveToTemp(Release release) throws Exception {
        Path tmpPath = Paths.get("./tmp");
        FileUtils.deleteDirectory(tmpPath);
        Files.createDirectory(tmpPath);

        if (isWindows) {
            // download exe
            var optExe = release.getAssets().stream()
                    .filter(a -> a.getContent_type().equals("application/x-msdownload")).findFirst();
            if (optExe.isPresent()) {
                var exe = optExe.get();
                exe.download(tmpPath);
            }
        } else {
            // download jar (zip)
            var optZip = release.getAssets().stream()
                    .filter(a -> a.getContent_type().equals("application/x-zip-compressed")).findFirst();
            if (optZip.isPresent()) {
                var zip = optZip.get();
                zip.download(tmpPath);
                zip.unzip(null);
            }
        }
    }

    private void startTempApplication(String version) throws IOException, InterruptedException {
        if (isWindows){
            Path executablePath = Paths.get("./tmp/duerre-manager-" + version + "-runner.exe");
            executeCommand(executablePath.toString());
        }
        else
            executeCommand("java -jar ./tmp/quarkus-app.jar");
    }

    private void executeCommand(String command) throws IOException, InterruptedException {
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
