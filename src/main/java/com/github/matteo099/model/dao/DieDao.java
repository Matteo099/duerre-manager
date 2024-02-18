package com.github.matteo099.model.dao;

import com.github.matteo099.model.interfaces.IDie;

public class DieDao implements IDie {
    public String name;
    public DieDataDao dieData;
    public String data;

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
}
