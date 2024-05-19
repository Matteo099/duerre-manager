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
import com.github.matteo099.utils.ProcessUtils;

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

    @Getter
    private final UpdateStatus updateStatus = new UpdateStatus(this::pushStatus);

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
            updateStatus.setUpdating(false);
            updateStatus.setError(null);
            forceStopApplication(100L);
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
        Path tmpPath = Paths.get(Updater.UPDATE_DIRECTORY);
        FileUtils.deleteDirectory(tmpPath);
        Files.createDirectory(tmpPath);

        if (ProcessUtils.isWindows()) {
            logger.info("Start downloading exe file...");
            // download exe
            var optExe = release.getAssets().stream()
                    .filter(a -> a.getContent_type().equals("application/x-msdownload")).findFirst();
            if (optExe.isPresent()) {
                var exe = optExe.get();
                exe.download(tmpPath, updateStatus);
            } else {
                logger.warn("Exe file not found for download...");
                throw new Exception("No exe file found");
            }
        } else {
            // download jar
            logger.info("Start downloading jar file...");
            var optJar = release.getAssets().stream()
                    .filter(a -> a.getContent_type().equals("application/java-archive")).findFirst();
            if (optJar.isPresent()) {
                var jar = optJar.get();
                jar.download(tmpPath, updateStatus);
            } else {
                logger.warn("Jar file not found for download...");
                throw new Exception("No jar file found");
            }
        }
    }

    private void startTempApplication(String version) throws IOException, InterruptedException {
        ProcessUtils.setInfoLogger(logger::info);
        final var updateDir = Paths.get(Updater.UPDATE_DIRECTORY);
        
        if (ProcessUtils.isWindows()) {
            final var tmpApp = Updater.getFileName("exe");
            logger.info("Starting temp application = " + tmpApp);

            ProcessUtils.executeCommand(updateDir.resolve(tmpApp).toAbsolutePath().toString(), updateDir);
        } else {
            final var tmpApp = Updater.getFileName("jar");
            logger.info("Starting temp application = " + tmpApp);
            ProcessUtils.executeCommand("java -jar " + updateDir.resolve(tmpApp).toAbsolutePath().toString(), updateDir);
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
