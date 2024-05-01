package com.github.matteo099.model.projections;

import com.github.matteo099.model.interfaces.IDieShapeExport;

public interface IDieSearchResult<D extends IDieShapeExport<?>> {
    String getName();
    D getDieData();
    Double getTextScore();
    Double getSizeScore();
    Double getMatchScore();
    Double getTotalScore();
    void setMatchScore(Double matchScore);
}