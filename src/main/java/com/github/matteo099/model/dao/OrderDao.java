package com.github.matteo099.model.dao;

import java.util.Date;

import com.github.matteo099.model.entities.OrderStatus;
import com.github.matteo099.model.interfaces.ICustomer;
import com.github.matteo099.model.interfaces.IOrder;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDao implements IOrder<ICustomer> {

    public String dieName;
    public String customer;
    public Long quantity;
    public String description;
    public Date creationDate;
    public Date expirationDate;
    public Date completitionDate;
    public Boolean cancelled;
    public OrderStatus status;
    public Long completitionTime;

    @Override
    public ICustomer getCustomer() {
        return new ICustomer() {
            @Override
            public String getName() {
                return customer;
            }
        };
    }

    @Override
    public String getId() {
        return null;
    }
}
