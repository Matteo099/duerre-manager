package com.github.matteo099.model.projections;

import com.github.matteo099.model.entities.Order;

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
@ProjectionFor(Order.class)
public class OrderAggregationResult {
    private String id;
    private int count;
}
