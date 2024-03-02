package com.github.matteo099.model.interfaces;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;

public interface IDie {
    String getName();
    List<String> getAliases();
    IDieData getDieData();
    ICustomer getCustomer();

    DieType getDieType();
    MaterialType getMaterial();
    Double getTotalHeight();
    Double getTotalWidth();
    Double getShoeWidth();
    Double getCrestWidth();
}
