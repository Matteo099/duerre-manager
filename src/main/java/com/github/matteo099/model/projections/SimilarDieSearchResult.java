package com.github.matteo099.model.projections;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class SimilarDieSearchResult implements Comparable<SimilarDieSearchResult> {
    private Long dieId;
    private double matchScore;

    public SimilarDieSearchResult(Long dieId, double similarityScore) {
        this.dieId = dieId;
        this.matchScore = similarityScore;
    }

    public Long getDieId() {
        return dieId;
    }

    public double getMatchScore() {
        return matchScore;
    }

    @Override
    public int compareTo(SimilarDieSearchResult o) {
        return matchScore > o.matchScore ? 1 : -1;
    }
}
