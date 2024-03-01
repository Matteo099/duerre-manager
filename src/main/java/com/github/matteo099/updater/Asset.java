package com.github.matteo099.updater;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class Asset {
    private String name;
    private String content_type;
    private String browser_download_url;

    private Path zipPath;

    protected Asset() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent_type() {
        return content_type;
    }

    public void setContent_type(String content_type) {
        this.content_type = content_type;
    }

    public String getBrowser_download_url() {
        return browser_download_url;
    }

    public void setBrowser_download_url(String browser_download_url) {
        this.browser_download_url = browser_download_url;
    }

    public void download(String path) throws IOException {
        zipPath = Paths.get(path, name);

        // Download zip file
        URL url = new URL(browser_download_url);
        HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();
        InputStream inputStream = httpURLConnection.getInputStream();
        Files.copy(inputStream, zipPath);

        // Extract zip file
        try (ZipInputStream zipInputStream = new ZipInputStream(new FileInputStream(name))) {
            ZipEntry entry;
            while ((entry = zipInputStream.getNextEntry()) != null) {
                if (!entry.isDirectory() && entry.getName().endsWith(".zip")) {
                    String fileName = Paths.get(entry.getName()).getFileName().toString();
                    Files.copy(zipInputStream, Paths.get(fileName));
                }
            }
        }
    }

    public void unzip(Path destDir) throws FileNotFoundException, IOException {
        byte[] buffer = new byte[1024];
        try (ZipInputStream zipInputStream = new ZipInputStream(new FileInputStream(zipPath.toFile()))) {
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
