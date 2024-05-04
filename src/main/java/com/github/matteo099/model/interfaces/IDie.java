package com.github.matteo099.model.interfaces;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;

public interface IDie<D extends IDieShapeExport<?>, C extends ICustomer> {
    String getName();
    List<String> getAliases();
    D getDieData();
    C getCustomer();

    DieType getDieType();
    MaterialType getMaterial();
    Double getTotalHeight();
    Double getTotalWidth();
    Double getShoeWidth();
    Double getCrestWidth();
}
