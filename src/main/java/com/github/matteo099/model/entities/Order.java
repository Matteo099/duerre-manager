package com.github.matteo099.model.entities;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

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
    private LocalDateTime expirationDate;
    private LocalDateTime completitionDate;
    private LocalDateTime startDate;
    private OrderStatus status;
    private Long duration;

    public Order(IOrder<?> order, Customer customer) {
        this.customer = customer;
        dieName = order.getDieName();
        quantity = order.getQuantity();
        description = order.getDescription();
        expirationDate = order.getExpirationDate();
        creationDate = LocalDateTime.now();
        status = OrderStatus.TODO;
    }

    @Override
    public String getOrderId() {
        return id.toString();
    }

    public void calculateCompletitionTime() {
        if (startDate == null || completitionDate == null)
            return;
        var startTime = startDate.atZone(ZoneOffset.systemDefault()).toInstant().toEpochMilli();
        var completitionTime = startDate.atZone(ZoneOffset.systemDefault()).toInstant().toEpochMilli();
        duration = completitionTime - startTime;
    }
}
