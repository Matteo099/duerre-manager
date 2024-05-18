package com.github.matteo099.model.dao;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

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
    public Instant expirationDate;
    public OrderStatus status;

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
    public LocalDateTime getExpirationDate() {
        return LocalDateTime.ofInstant(expirationDate, ZoneId.systemDefault());
    }

    @Override
    public String getOrderId() {
        return null;
    }
}
