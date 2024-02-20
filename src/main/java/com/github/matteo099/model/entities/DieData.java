package com.github.matteo099.model.entities;

import com.github.matteo099.model.interfaces.IDieData;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.Entity;

@Entity
@RegisterForReflection
public class DieData extends PanacheEntity implements IDieData {

    protected DieData() { }


    public DieData(IDieData dieData) {
        
    }
    
}
