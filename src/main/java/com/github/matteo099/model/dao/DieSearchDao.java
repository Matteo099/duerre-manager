package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;

import lombok.Getter;

@Getter
public class DieSearchDao {
    public List<String> names;
    public DieDataDao dieData;
    public List<String> customers;
    public List<DieType> dieTypes;
    public List<MaterialType> materials;
    public Double totalHeight;
    public Double totalWidth;
    public Double shoeWidth;
    public Double crestWidth;
}
