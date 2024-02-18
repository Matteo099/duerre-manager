package com.github.matteo099.model.entities;

import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.interfaces.IDieData;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;

@Entity
@RegisterForReflection
public class Die extends PanacheEntity implements IDie {

    private String name;
    private String data;
    @OneToOne(cascade = CascadeType.ALL)
    private DieData dieData;

    protected Die() { }

    public Die(IDie iDie) {
        name = iDie.getName();
        data = iDie.getData();
        dieData = new DieData(iDie.getDieData());
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public String getData() {
        return data;
    }

    @Override
    public IDieData getDieData() {
        return dieData;
    }

}
