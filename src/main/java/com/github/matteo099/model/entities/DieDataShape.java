package com.github.matteo099.model.entities;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieDataShape;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;

@Entity
@RegisterForReflection
public class DieDataShape extends PanacheEntity implements IDieDataShape {

    private String type;
    @ElementCollection(fetch = FetchType.EAGER)
    private List<Double> points;

    protected DieDataShape() { }

    public DieDataShape(IDieDataShape dieDataShape) {
        this.type = dieDataShape.getType();
        this.points = dieDataShape.getPoints();
    }

    @Override
    public String getType() {
        return type;
    }

    @Override
    public List<Double> getPoints() {
        return points;
    }    
}
