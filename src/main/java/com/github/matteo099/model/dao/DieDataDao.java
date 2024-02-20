package com.github.matteo099.model.dao;

import java.util.ArrayList;
import java.util.List;

import com.github.matteo099.model.interfaces.IDieData;
import com.github.matteo099.model.interfaces.IDieDataShape;

public class DieDataDao implements IDieData {
    public List<DieDataShapeDao> state;

    @Override
    public List<IDieDataShape> getState() {
        List<IDieDataShape> shapes = new ArrayList<>();
        for (DieDataShapeDao shape : state) {
            shapes.add(shape);
        }
        return shapes;
    }
}
