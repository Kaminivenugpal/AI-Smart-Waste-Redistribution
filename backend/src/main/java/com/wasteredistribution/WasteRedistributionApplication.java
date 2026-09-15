package com.wasteredistribution;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WasteRedistributionApplication {

    public static void main(String[] args) {
        SpringApplication.run(WasteRedistributionApplication.class, args);
        System.out.println("\n====================================================");
        System.out.println(" AI Smart Waste Redistribution Platform (Module 1)");
        System.out.println(" Backend Server is Running on http://localhost:8080");
        System.out.println("====================================================\n");
    }
}
