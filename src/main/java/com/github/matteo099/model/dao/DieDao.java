package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;

public class DieDao implements IDie {
    public String name;
    public DieDataDao dieData;
    public String customer;
    public List<String> aliases;
    public DieType dieType;
    public MaterialType material;
    public Double totalHeight;
    public Double totalWidth;
    public Double shoeWidth;
    public Double crestWidth;

    @Override
    public String getName() {
        return name;
    }

    @Override
    public DieDataDao getDieData() {
        return dieData;
    }

    @Override
    public ICustomer getCustomer() {
        return new ICustomer() {
            @Override
            public String getName() {
                return customer;
            }
        };
    }

    @Override
    public List<String> getAliases() {
        return aliases;
    }

    @Override
    public DieType getDieType() {
        return dieType;
    }

    @Override
    public MaterialType getMaterial() {
        return material;
    }

    @Override
    public Double getTotalHeight() {
        return totalHeight;
    }

    @Override
    public Double getTotalWidth() {
        return totalWidth;
    }

    @Override
    public Double getShoeWidth() {
        return shoeWidth;
    }

    @Override
    public Double getCrestWidth() {
        return crestWidth;
    }
}
