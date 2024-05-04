package com.github.matteo099.services;

import java.util.List;
import java.util.Optional;

import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.interfaces.ICustomer;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CustomerService {

    public List<Customer> listAll() {
        return Customer.listAll();
    }

    public Customer findByIdOrCreate(ICustomer customer) {
        Optional<Customer> optCustomer = Customer.findByIdOptional(customer.getName());
        if (optCustomer.isPresent())
            return optCustomer.get();

        Customer newCustomer = new Customer(customer);
        newCustomer.persist();
        return newCustomer;
    }
}
