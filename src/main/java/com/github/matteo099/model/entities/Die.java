package com.github.matteo099.model.entities;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.interfaces.IDieData;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
@RegisterForReflection
public class Die extends PanacheEntity implements IDie {

    private String name;

    @Column(nullable = true)
    private String data;
    
    @OneToOne(cascade = CascadeType.ALL)
    private DieData dieData;
    
    @CreationTimestamp
    private LocalDateTime creationDate;

    @ManyToOne(cascade = CascadeType.ALL)
    private Customer customer;

    protected Die() {
    }

    public Die(IDie iDie, Customer customer) {
        name = iDie.getName();
        data = iDie.getData();
        dieData = new DieData(iDie.getDieData());
        this.customer = customer;
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

    @Override
    public ICustomer getCustomer() {
        return customer;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }
}
