package com.github.matteo099.model.entities;

import java.time.LocalDateTime;
import java.util.Date;

import com.github.matteo099.model.interfaces.IOrder;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@MongoEntity(collection = "orders")
@RegisterForReflection
@Setter
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends PanacheMongoEntity implements IOrder<Customer> {

    private String dieName;
    private Customer customer;
    private Long quantity;
    private String description;
    private LocalDateTime creationDate;
    private Date expirationDate;
    private Date completitionDate;
    private Boolean cancelled;
    private OrderStatus status;
    private Long completitionTime;

    public Order(IOrder<?> order, Customer customer) {
        this.customer = customer;
        dieName = order.getDieName();
        quantity = order.getQuantity();
        description = order.getDescription();
        expirationDate = order.getExpirationDate();
        creationDate = LocalDateTime.now();
        status = OrderStatus.TODO;
        cancelled = false;
    }

    @Override
    public String getId() {
        return id.toString();
    }
}
