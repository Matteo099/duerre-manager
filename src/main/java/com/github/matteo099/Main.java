package com.github.matteo099;

import com.github.matteo099.updater.Updater;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;

@QuarkusMain
public class Main {

    public static final String UPDATE_FOLDER = "tmp";

    public static void main(String... args) {
        if (Updater.isTempApplication()) {
            System.out.println("Temp application recognized!");
            Updater.start();
        } else {
            // TODO: remove comment
            // Updater.cleanDirectory();
            Quarkus.run(MyApp.class, args);
        }
    }

    public static class MyApp implements QuarkusApplication {
        @Override
        public int run(String... args) throws Exception {
            Quarkus.waitForExit();
            return 0;
        }
    }
}
