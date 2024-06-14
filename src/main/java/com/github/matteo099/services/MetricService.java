package com.github.matteo099.services;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.util.LinkedList;
import java.util.List;

import javax.swing.filechooser.FileSystemView;

import com.github.matteo099.model.Metric;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MetricService {

    public Metric computeCPU() {
        double cpuLoad = ManagementFactory.getPlatformMXBean(
                com.sun.management.OperatingSystemMXBean.class).getCpuLoad();
        return Metric.builder().usage(cpuLoad * 100).build();
    }

    public Metric computeRAM() {
        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
        var ramLoad = ((double) memoryMXBean.getHeapMemoryUsage().getUsed())
                / ((double) memoryMXBean.getHeapMemoryUsage().getMax());
        // System.out.println(ramLoad);
        return Metric.builder().usage(ramLoad * 100).build();

        // System.out.println(String.format("Initial memory: %.2f GB",
        // (double) memoryMXBean.getHeapMemoryUsage().getInit() / 1073741824));
        // System.out.println(String.format("Used heap memory: %.2f GB",
        // (double) memoryMXBean.getHeapMemoryUsage().getUsed() / 1073741824));
        // System.out.println(String.format("Max heap memory: %.2f GB",
        // (double) memoryMXBean.getHeapMemoryUsage().getMax() / 1073741824));

        // return Metric.builder().usage((double)
        // memoryMXBean.getHeapMemoryUsage().getCommitted() / 1073741824).build();
    }

    public List<Metric> computeHDD() {
        File[] paths;
        FileSystemView fsv = FileSystemView.getFileSystemView();

        // returns pathnames for files and directory
        paths = File.listRoots();
        var list = new LinkedList<Metric>();

        // for each pathname in pathname array
        for (File path : paths) {
            // prints file and directory paths
            // System.out.println("Drive Name: " + path);
            // System.out.println("Description: " + fsv.getSystemTypeDescription(path));
            double tot = path.getTotalSpace();
            double free = path.getFreeSpace();
            double size = tot - free;
            // System.out.printf("usable %.3f GB\n", size);
            // System.out.printf("total %.3f GB\n", tot);
            // System.out.printf("free %.3f GB\n", free);
            list.add(Metric.builder().usage(size).description("").build());
        }

        return list;
    }
}
