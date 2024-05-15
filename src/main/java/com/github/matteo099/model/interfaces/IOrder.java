package com.github.matteo099.model.interfaces;

import java.util.Date;

public interface IOrder<C extends ICustomer> {
    String getId();
    String getDieName();
    C getCustomer();
    Long getQuantity();
    String getDescription();
    Date getExpirationDate();
}
