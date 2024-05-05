package com.github.matteo099;

import org.eclipse.microprofile.config.ConfigProvider;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.QuarkusApplication;
import io.quarkus.runtime.annotations.QuarkusMain;

@QuarkusMain
public class Main {

    public static void main(String... args) {
        System.out.println("Before Quarkus run");
        Quarkus.run(MyApp.class, (a, d) -> {
            var v = ConfigProvider.getConfig().getValue("quarkus.application.version", String.class);
            System.out.println("Exception catched " + a + " " + d + " " + v);
        }, args);
        System.out.println("After Quarkus run");
    }

    public static class MyApp implements QuarkusApplication {
        @Override
        public int run(String... args) throws Exception {
            System.out.println("Before Quarkus waitForExit");
            Quarkus.waitForExit();
            System.out.println("After Quarkus waitForExit");

            return 0;
        }
    }
}
