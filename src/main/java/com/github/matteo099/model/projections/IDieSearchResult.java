package com.github.matteo099.model.projections;

public interface IDieSearchResult {
    String getName();
    Double getTextScore();
    Double getSizeScore();
    Double getMatchScore();    
}