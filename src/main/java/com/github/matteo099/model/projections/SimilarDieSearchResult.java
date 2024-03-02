package com.github.matteo099.model.projections;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class SimilarDieSearchResult implements Comparable<SimilarDieSearchResult> {
    private String dieId;
    private double matchScore;

    public SimilarDieSearchResult(String dieId, double similarityScore) {
        this.dieId = dieId;
        this.matchScore = similarityScore;
    }

    public String getDieId() {
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
