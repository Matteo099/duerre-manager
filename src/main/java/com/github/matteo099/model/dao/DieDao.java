package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IDie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DieDao implements IDie<DieShapeExport, ICustomer> {
    public String name;
    public DieShapeExport dieData;
    public String customer;
    public List<String> aliases;
    public DieType dieType;
    public MaterialType material;
    public Double totalHeight;
    public Double totalWidth;
    public Double shoeWidth;
    public Double crestWidth;

    @Override
    public ICustomer getCustomer() {
        return new ICustomer() {
            @Override
            public String getName() {
                return customer;
            }
        };
    }
}
