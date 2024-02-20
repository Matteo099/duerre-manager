package com.github.matteo099.services;

import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDie;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class DieService {

    @Transactional
    public Long createDie(IDie iDie) {
        var die = new Die(iDie);
        die.persist();
        return die.id;
    }
}
