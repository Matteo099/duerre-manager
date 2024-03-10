package com.github.matteo099.services;

import java.util.List;
import java.util.Optional;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.exceptions.MalformedDieException;
import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.projections.CompleteDieSearchResult;
import com.github.matteo099.model.projections.DieSearchResult;
import com.github.matteo099.opencv.DieMatcher;
import com.mongodb.client.model.Filters;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class DieService {

    @Inject
    CustomerService customerService;

    @Inject
    DieMatcher dieMatcher;

    public String createDie(IDie<?, ?> iDie) throws DieAlreadyExists {
        if (existsDie(iDie.getName()))
            throw new DieAlreadyExists(
                    String.format("Lo stampo '%s' esiste già! Utilizzare un nome diverso.", iDie.getName()));

        Customer customer = customerService.findByIdOrCreate(iDie.getCustomer());
        var die = new Die(iDie, customer);
        die.persist();
        return die.getName();
    }

    public List<Die> listDies() {
        return Die.listAll();
    }

    public boolean existsDie(String name) {
        return Die.findByIdOptional(name).isPresent();
    }

    // public List<SimilarDieSearchResult> searchSimilarDies(DieSimilarSearchDao
    // dieSimilarSearchDao, Float threshold)
    // throws MalformedDieException {
    // List<SimilarDieSearchResult> results =
    // dieMatcher.searchSimilarDies(dieSimilarSearchDao.getDieData(),
    // threshold);
    // // TODO: save the research...
    // return results;
    // }

    public List<DieSearchResult> searchDies(DieSearchDao dieSearchDao, Float threshold)
            throws MalformedDieException {

        var allFilters = dieSearchDao.getAllFilters();
        var filter = allFilters.isEmpty() ? null : Filters.and(allFilters).toBsonDocument().toString();
        var diesByProperties = (filter == null ? Die.findAll() : Die.find(filter))
                .project(CompleteDieSearchResult.class)
                .stream()
                .peek(e -> e.computeBaseScore(dieSearchDao))
                .toList();

        return dieMatcher.searchSimilarDiesFrom(dieSearchDao.getDieData(), threshold, diesByProperties)
                .stream()
                .sorted()
                .toList();
    }

    public Optional<Die> findDie(Long id) {
        return Die.findByIdOptional(id);
    }
}
