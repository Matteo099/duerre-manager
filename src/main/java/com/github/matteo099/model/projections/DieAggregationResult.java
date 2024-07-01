package com.github.matteo099.model.projections;

import com.github.matteo099.model.entities.Die;

import io.quarkus.mongodb.panache.common.ProjectionFor;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RegisterForReflection
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ProjectionFor(Die.class)
public class DieAggregationResult {
    private String id;
    private int count;
}
