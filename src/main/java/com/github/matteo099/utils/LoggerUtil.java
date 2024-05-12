package com.github.matteo099.utils;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.LinkedList;
import java.util.List;

public class LoggerUtil {

    public static LoggerUtil instance = new LoggerUtil();

    // private Logger logger = Logger.getLogger(getClass());

    private List<String> messages = new LinkedList<>();

    public void info(String message) {
        // logger.info(message);
        System.out.println(message);
        messages.add(message);
        save();
    }

    public void save() {
        String fileName = "logs.log";
        try (PrintWriter writer = new PrintWriter(new FileWriter(fileName))) {
            // Writing each message to the file
            for (String message : messages) {
                writer.println(message);
            }
            System.out.println("Messages saved to " + fileName);
        } catch (IOException e) {
            System.err.println("Error saving messages to file: " + e.getMessage());
        }
    }

}
