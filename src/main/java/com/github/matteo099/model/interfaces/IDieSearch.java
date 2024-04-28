package com.github.matteo099.model.interfaces;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;

public interface IDieSearch {
    public String getText();
    public IDieShapeExport<?> getDieData();
    public List<String> getCustomers();
    public List<DieType> getDieTypes();
    public List<MaterialType> getMaterials();
    public Double getTotalHeight();
    public Double getTotalWidth();
    public Double getShoeWidth();
    public Double getCrestWidth();
}