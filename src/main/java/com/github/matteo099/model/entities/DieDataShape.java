package com.github.matteo099.model.entities;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieDataShape;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RegisterForReflection
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DieDataShape implements IDieDataShape {

    private String type;
    private List<Double> points;

    public DieDataShape(IDieDataShape dieDataShape) {
        this.type = dieDataShape.getType();
        this.points = dieDataShape.getPoints();
    }
}
