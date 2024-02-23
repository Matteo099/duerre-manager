package com.github.matteo099.services;

import java.util.List;

import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDie;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DieService {

    @Inject
    CustomerService customerService;

    @Transactional
    public Long createDie(IDie iDie) {
        Customer customer = customerService.findByIdOrCreate(iDie.getCustomer());
        var die = new Die(iDie, customer);
        die.persist();
        return die.id;
    }

    public List<Die> listDies() {
        return Die.listAll();    
    }
}
