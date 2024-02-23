package com.github.matteo099.model.entities;

import com.github.matteo099.model.interfaces.ICustomer;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
@RegisterForReflection
public class Customer extends PanacheEntityBase implements ICustomer {
    @Id
    private String name;

    protected Customer() {

    }

    public Customer(ICustomer customer) {
        this.name = customer.getName();
    }

    @Override
    public String getName() {
        return name;
    }
}
