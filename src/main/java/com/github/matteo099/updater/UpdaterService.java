package com.github.matteo099.updater;

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
    private boolean debug = true;

    @Getter
    private final UpdateStatus updateStatus = new UpdateStatus(this::pushStatus);
    // private volatile boolean updateInProgress = false;
    // private Exception updateError;
    // private UpdatePhase updatePhase;

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

        if (!latestVersion.equals(version) || debug) {
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
            // startTempApplication(latestVersion);
            // forceStopApplication(1500L);
            updateStatus.setUpdating(false);
            updateStatus.setError(null);
        } catch (Exception e) {
            updateStatus.setError(e.getMessage());
        }
    }

    public boolean updateAvailable() {
        Release latestRelease = gitHubService.getLatestRelease(repoOwner, repoName);
        String latestVersion = latestRelease.getTag_name().replace("v", "");

        return !latestVersion.equals(version);
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
            Path executablePath = Paths.get("./tmp/duerre-manager-" + version + "-runner.exe");
            executeCommand(executablePath.toString());
        } else
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
