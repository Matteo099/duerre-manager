package com.github.matteo099.services;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Order;
import com.github.matteo099.model.entities.OrderStatus;
import com.github.matteo099.model.interfaces.IOrder;
import com.github.matteo099.model.projections.OrderAggregationResult;
import com.mongodb.client.model.Accumulators;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;

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

    public List<OrderAggregationResult> getDistribution() {
        Bson groupStage = Aggregates.group("$status", Accumulators.sum("count", 1));
        List<Bson> pipeline = Arrays.asList(groupStage);
        var aggregation = Order.mongoCollection().aggregate(pipeline, OrderAggregationResult.class);
        return StreamSupport.stream(aggregation.spliterator(), false).toList();
    }

    /**
     * Compute the top n order more requested (same dieName) in a range date
     * interval
     * 
     * @param n
     * @param from
     * @param to
     * @return
     */
    public List<OrderAggregationResult> getTop(int n, Date from, Date to) {
        List<Bson> pipeline = new LinkedList<>();
        
        // fiter by date interval
        if (from != null || to != null) {
            var allFilters = new LinkedList<Bson>();
            if(from != null) allFilters.add(Filters.gte("creationDate", from));
            if(to != null) allFilters.add(Filters.lte("creationDate", to));
            Bson filterStage = Aggregates.match(Filters.and(allFilters));
            pipeline.add(filterStage);
        }

        // group by dieName and count the occourences
        Bson groupStage = Aggregates.group("$dieName", Accumulators.sum("count", 1));
        pipeline.add(groupStage);

        // sort by count
        Bson sortStage = Aggregates.sort(Sorts.descending("count"));
        pipeline.add(sortStage);

        // get first n results
        Bson limitStage = Aggregates.limit(n);
        pipeline.add(limitStage);

        var aggregation = Order.mongoCollection().aggregate(pipeline, OrderAggregationResult.class);
        return StreamSupport.stream(aggregation.spliterator(), false).toList();
    }
}
