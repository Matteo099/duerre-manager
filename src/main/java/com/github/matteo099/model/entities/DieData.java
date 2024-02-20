package com.github.matteo099.model.entities;

import java.util.ArrayList;
import java.util.List;

import com.github.matteo099.model.interfaces.IDieData;
import com.github.matteo099.model.interfaces.IDieDataShape;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
@RegisterForReflection
public class DieData extends PanacheEntity implements IDieData {

    @OneToMany(cascade = CascadeType.ALL)
    private List<DieDataShape> state = new ArrayList<>();

    protected DieData() {
    }

    public DieData(IDieData dieData) {
        dieData.getState().forEach(s -> state.add(new DieDataShape(s)));
    }

    @Override
    public List<IDieDataShape> getState() {
        List<IDieDataShape> shapes = new ArrayList<>();
        for (DieDataShape shape : state) {
            shapes.add(shape);
        }
        return shapes;
    }
}
