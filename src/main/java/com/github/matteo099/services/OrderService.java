package com.github.matteo099.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Order;
import com.github.matteo099.model.entities.OrderStatus;
import com.github.matteo099.model.interfaces.IOrder;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

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

        return order.getOrderId();
    }

    public String editOrder(IOrder<?> iOrder) throws DieAlreadyExists {
        deleteOrder(new ObjectId(iOrder.getOrderId()));
        return createOrder(iOrder);
    }

    public Order updateOrderStatus(String id, OrderStatus status) {
        var orderOpt = findOrder(new ObjectId(id));
        if (orderOpt.isEmpty())
            throw new NotFoundException("Ordine non trovato!");

        var order = orderOpt.get();
        switch (status) {
            case IN_PROGRESS:
                order.setStartDate(LocalDateTime.now());
                break;
            case DONE:
                order.setCompletitionDate(LocalDateTime.now());
                order.calculateCompletitionTime();
                break;
            default:
                break;
        }
        order.setStatus(status);
        order.update();
        return order;
    }

    public List<Order> listOrders() {
        return Order.listAll();
    }

    public boolean existsOrder(ObjectId id) {
        return Order.findByIdOptional(id).isPresent();
    }

    public Optional<Order> findOrder(ObjectId id) {
        return Order.findByIdOptional(id);
    }

    public boolean deleteOrder(ObjectId id) {
        return Order.deleteById(id);
    }
}
