package com.github.matteo099.model.projections;

import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDie;

import io.quarkus.mongodb.panache.common.ProjectionFor;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;

@RegisterForReflection
@Getter
@AllArgsConstructor
@ProjectionFor(Die.class)
public class DieSearchResult implements Comparable<DieSearchResult> {
    private String name;
    private Double matchScore = null;

    public DieSearchResult(IDie<?,?> die) {
        this(die.getName());
    }

    public DieSearchResult(String dieId) {
        this.name = dieId;
        this.matchScore = null;
    }

    @Override
    public int compareTo(DieSearchResult o) {
        return matchScore > o.matchScore ? 1 : -1;
    }
}
