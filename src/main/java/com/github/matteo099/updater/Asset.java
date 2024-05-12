package com.github.matteo099.updater;

import java.io.BufferedInputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import org.jboss.logging.Logger;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.json.bind.annotation.JsonbTransient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@RegisterForReflection
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Asset {

    @JsonbTransient
    Logger logger = Logger.getLogger(Asset.class);

    private String name;
    private String content_type;
    private String browser_download_url;

    private Path assetPath;

    public void download(Path path, UpdateStatus updateStatus)
            throws IOException, URISyntaxException {
        assetPath = path.resolve(name);

        // Download file
        URL url = new URI(browser_download_url).toURL();
        HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

        logger.info("Start downloading");

        try (InputStream inputStream = new BufferedInputStream(httpURLConnection.getInputStream());
                OutputStream outputStream = Files.newOutputStream(assetPath)) {
            long fileSize = httpURLConnection.getContentLengthLong();
            long downloadedSize = 0;
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = inputStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
                downloadedSize += bytesRead;
                double progress = (double) downloadedSize / fileSize;
                updateStatus.setProgress(progress);
                if(progress >= 0.2) 
                    throw new IOException("Some error");
            }
            logger.info("Download completed.");
        } finally {
            httpURLConnection.disconnect();
        }
    }

    public void unzip(Path destDir) throws FileNotFoundException, IOException {
        if (!content_type.equals("application/x-zip-compressed"))
            return;

        if (destDir == null) {
            destDir = Paths.get(".");
        }
        byte[] buffer = new byte[1024];
        try (ZipInputStream zipInputStream = new ZipInputStream(new FileInputStream(assetPath.toFile()))) {
            ZipEntry entry = zipInputStream.getNextEntry();
            while (entry != null) {
                String fileName = entry.getName();
                Path filePath = destDir.resolve(fileName);
                if (!entry.isDirectory()) {
                    try (FileOutputStream fos = new FileOutputStream(filePath.toFile())) {
                        int len;
                        while ((len = zipInputStream.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                } else {
                    Files.createDirectories(filePath);
                }
                zipInputStream.closeEntry();
                entry = zipInputStream.getNextEntry();
            }
        }
    }
}
