package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieData;

import lombok.Getter;

@Getter
public class DieDataDao implements IDieData<DieDataShapeDao> {
    public List<DieDataShapeDao> state;
}
