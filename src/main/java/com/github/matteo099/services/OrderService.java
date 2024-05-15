package com.github.matteo099.services;

import java.util.List;
import java.util.Optional;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Order;
import com.github.matteo099.model.interfaces.IOrder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class OrderService {

    @Inject
    CustomerService customerService;

    @Inject
    DieService dieService;

    public String createOrder(IOrder<?> iOrder) throws DieAlreadyExists {
        Customer customer = customerService.findByIdOrCreate(iOrder.getCustomer());
        var order = new Order(iOrder, customer);
        order.persist();

        return order.getId();
    }

    public String editOrder(IOrder<?> iOrder) throws DieAlreadyExists {
        deleteOrder(iOrder.getId());
        return createOrder(iOrder);
    }

    public List<Order> listOrders() {
        return Order.listAll();
    }

    public boolean existsOrder(String id) {
        return Order.findByIdOptional(id).isPresent();
    }

    public Optional<Order> findOrder(String id) {
        return Order.findByIdOptional(id);
    }

    public boolean deleteOrder(String id) {
        return Order.deleteById(id);
    }
}
