package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieDataShape;

import lombok.Getter;

@Getter
public class DieDataShapeDao implements IDieDataShape {
    public String type;
    public List<Double> points;
}
