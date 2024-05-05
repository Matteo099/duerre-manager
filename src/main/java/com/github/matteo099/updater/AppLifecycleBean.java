package com.github.matteo099.updater;

import org.jboss.logging.Logger;

import io.quarkus.runtime.Quarkus;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
public class AppLifecycleBean {
    @Inject
    Logger logger;

    void onStart(@Observes StartupEvent ev) {
        logger.info("The application is starting...{}");
    }

    public void stopApplication() {
        new Thread(new Runnable() {
            @Override
            public void run() {
                logger.info("About to system exit.");
                try {
                    Thread.sleep(5000);
                    Quarkus.asyncExit();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public void forceStopApplication(Long millis) {
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