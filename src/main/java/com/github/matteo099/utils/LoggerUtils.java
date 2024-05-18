package com.github.matteo099.utils;

import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

public class LoggerUtils {

    public static LoggerUtils instance = new LoggerUtils();

    private List<String> messages = new LinkedList<>();
    private static SimpleDateFormat simpleDateFormat = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss.SSS");

    public void info(String message) {
        final var now = new Date();
        message = "[ " + simpleDateFormat.format(now) + " ] [INFO] " + message;

        System.out.println(message);
        messages.add(message);
        save();
    }

    public void exception(Exception exception) {
        exception.printStackTrace();

        final var now = new Date();
        var message = "[ " + simpleDateFormat.format(now) + " ] [INFO] " + exception.toString() + " - " + exception.getMessage();
        messages.add(message);
        for (StackTraceElement st : exception.getStackTrace())
            messages.add("\tat " + st);
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
