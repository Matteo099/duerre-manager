package com.github.matteo099.model.interfaces;

import java.time.LocalDateTime;

public interface IOrder<C extends ICustomer> {
    String getOrderId();
    String getDieName();
    C getCustomer();
    Long getQuantity();
    String getDescription();
    LocalDateTime getExpirationDate();
}
