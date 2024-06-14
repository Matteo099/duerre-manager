package com.github.matteo099.model;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@RegisterForReflection
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Metric {
    private double max;
    private double usage;
    private String description;
}
