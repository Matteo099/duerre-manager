package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;

public class DieDao implements IDie {
    public String name;
    public DieDataDao dieData;
    public String data;
    public String customer;
    public List<String> aliases;

    @Override
    public String getName() {
        return name;
    }

    @Override
    public DieDataDao getDieData() {
        return dieData;
    }

    @Override
    public String getData() {
        return data;
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
}
