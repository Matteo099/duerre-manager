package com.github.matteo099;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.junit.jupiter.api.Test;

import io.quarkus.test.junit.QuarkusTest;

@QuarkusTest
class GreetingResourceTest {

    @Test
    public void test() {
        var location = Paths.get("./tmp");
        System.out.println(location);
        System.out.println(location.toAbsolutePath());
        try {
            Files.deleteIfExists(location);
            var path = Files.createDirectories(location);
            System.out.println(path.toAbsolutePath());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}