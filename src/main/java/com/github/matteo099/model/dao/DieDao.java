package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;

import lombok.Getter;

@Getter
public class DieDao implements IDie<DieDataDao, ICustomer> {
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
    public ICustomer getCustomer() {
        return new ICustomer() {
            @Override
            public String getName() {
                return customer;
            }
        };
    }
}
