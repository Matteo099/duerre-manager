package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieDataShape;

public class DieDataShapeDao implements IDieDataShape {

    public String type;
    public List<Double> points;

    @Override
    public String getType() {
        return type;
    }

    @Override
    public List<Double> getPoints() {
        return points;
    }

}
