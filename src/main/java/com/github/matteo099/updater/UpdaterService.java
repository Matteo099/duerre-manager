package com.github.matteo099.updater;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.SubmissionPublisher;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.jboss.logging.Logger;

import com.github.matteo099.utils.FileUtils;

import io.smallrye.mutiny.Multi;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import lombok.Getter;

@ApplicationScoped
public class UpdaterService {

    @Inject
    @RestClient
    GithubService gitHubService;

    @ConfigProperty(name = "quarkus.application.version", defaultValue = "1.0.0")
    String version;

    @ConfigProperty(name = "github.repo.owner")
    String repoOwner;

    @ConfigProperty(name = "github.repo.name")
    String repoName;

    @Inject
    Logger logger;

    private String os = System.getProperty("os.name");
    private Boolean isWindows = os.toLowerCase().contains("windows");

    @Getter
    private final UpdateStatus updateStatus = new UpdateStatus(this::pushStatus);

    @Getter
    private SubmissionPublisher<UpdateStatus> flowPublisher = new SubmissionPublisher<>();

    /**
     * download application
     * save in a temp folder
     * start the temp application
     * 
     * @param skipDownload for testing only
     * @return
     */
    public boolean update(boolean skipDownload) {
        if (updateStatus.getUpdating())
            return false;

        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name().replace("v", "");

        if (!latestVersion.equals(version)) {
            updateStatus.setUpdating(true);
            updateStatus.setError(null);
            updateStatus.setPhase(UpdatePhase.STARTING);
            new Thread(() -> performUpdate(skipDownload, latestRelease, latestVersion)).start();
        } else {
            resetUpdate();
        }

        return true;
    }

    private void performUpdate(boolean skipDownload, Release latestRelease, String latestVersion) {
        try {
            if (!skipDownload) {
                updateStatus.setPhase(UpdatePhase.DOWNLOADING);
                downloadAndSaveToTemp(latestRelease);
            }
            updateStatus.setPhase(UpdatePhase.INSTALLING);
            startTempApplication(latestVersion);
            forceStopApplication(1500L);
            updateStatus.setUpdating(false);
            updateStatus.setError(null);
        } catch (Exception e) {
            updateStatus.setError(e.getMessage());
        }
    }

    public UpdateAvailable updateAvailable() {
        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name().replace("v", "");

        return UpdateAvailable.builder().available(!latestVersion.equals(version)).version(latestVersion).build();
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
                exe.download(tmpPath, updateStatus);
            }
        } else {
            // download jar (zip)
            var optZip = release.getAssets().stream()
                    .filter(a -> a.getContent_type().equals("application/x-zip-compressed")).findFirst();
            if (optZip.isPresent()) {
                var zip = optZip.get();
                zip.download(tmpPath, updateStatus);
                zip.unzip(null);
            }
        }
    }

    private void startTempApplication(String version) throws IOException, InterruptedException {
        if (isWindows) {
            executeCommand("duerre-manager-" + version + "-runner.exe", Paths.get("tmp"));
        } else
            executeCommand("java -jar /quarkus-app.jar", Paths.get("tmp"));
    }

    private void executeCommand(String command, Path pwd) throws IOException, InterruptedException {
        try {
            logger.info("Executing command: " + command);
            // Define the command to launch a new process
            ProcessBuilder processBuilder = new ProcessBuilder(command);

            // Set the working directory if needed
            if (pwd != null)
                processBuilder.directory(new File(pwd.toString()));

            // Start the process
            Process process = processBuilder.start();
            logger.info("Process started with pid: " + process.pid());

            // Print a message to indicate that the process has started
            logger.info("Independent process started successfully.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void pushStatus() {
        flowPublisher.submit(updateStatus);
        logger.debug(updateStatus);
    }

    public Multi<UpdateStatus> getStream() {
        return Multi.createFrom().publisher(flowPublisher);
    }

    public void resetUpdate() {
        updateStatus.setError(null);
        updateStatus.setPhase(null);
        updateStatus.setProgress(null);
        updateStatus.setUpdating(false);
    }

    private void forceStopApplication(Long millis) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                logger.info("About to system exit.");
                try {
                    Thread.sleep(millis);
                    System.exit(0);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
