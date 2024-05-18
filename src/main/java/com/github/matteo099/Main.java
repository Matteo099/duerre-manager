package com.github.matteo099;

import java.io.IOException;

import com.github.matteo099.updater.Updater;
import com.github.matteo099.utils.LoggerUtils;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;

@QuarkusMain
public class Main {

    public static void main(String... args) throws IOException, InterruptedException {
        LoggerUtils.instance.info("Start application!");
        LoggerUtils.instance.info("Working Directory = " + System.getProperty("user.dir"));

        if (Updater.isTempApplication()) {
            LoggerUtils.instance.info("Temp application recognized!");
            Updater.start();
        } else {
            Updater.cleanDirectory();
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
