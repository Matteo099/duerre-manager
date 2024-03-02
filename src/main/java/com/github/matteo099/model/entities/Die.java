package com.github.matteo099.model.entities;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.interfaces.IDieData;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;

@Entity
@RegisterForReflection
public class Die extends PanacheEntityBase implements IDie {

    @Id
    private String name;
    
    @ElementCollection(fetch = FetchType.EAGER)
    private List<String> aliases;

    @OneToOne(cascade = CascadeType.ALL)
    private DieData dieData;

    @ManyToOne(cascade = CascadeType.ALL)
    private Customer customer;

    private DieType dieType;

    private MaterialType material;

    private Double totalHeight;

    private Double totalWidth;

    private Double shoeWidth;

    private Double crestWidth;

    @CreationTimestamp
    private LocalDateTime creationDate;

    protected Die() {
    }

    public Die(IDie iDie, Customer customer) {
        name = iDie.getName();
        aliases = iDie.getAliases();
        dieData = new DieData(iDie.getDieData());
        this.customer = customer;

        dieType = iDie.getDieType();
        material = iDie.getMaterial();
        totalHeight = iDie.getTotalHeight();
        totalWidth = iDie.getTotalWidth();
        shoeWidth = iDie.getShoeWidth();
        crestWidth = iDie.getCrestWidth();
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public IDieData getDieData() {
        return dieData;
    }

    @Override
    public ICustomer getCustomer() {
        return customer;
    }

    @Override
    public List<String> getAliases() {
        return aliases;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    @Override
    public DieType getDieType() {
        return dieType;
    }

    @Override
    public MaterialType getMaterial() {
        return material;
    }

    @Override
    public Double getTotalHeight() {
        return totalHeight;
    }

    @Override
    public Double getTotalWidth() {
        return totalWidth;
    }

    @Override
    public Double getShoeWidth() {
        return shoeWidth;
    }

    @Override
    public Double getCrestWidth() {
        return crestWidth;
    }
}
