package com.github.matteo099.services;

import java.util.List;
import java.util.Optional;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.exceptions.MalformedDieException;
import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.dao.DieSimilarSearchDao;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.projections.DieSearchResult;
import com.github.matteo099.model.projections.SimilarDieSearchResult;
import com.github.matteo099.opencv.DieMatcher;

import io.quarkus.panache.common.Parameters;
import io.quarkus.panache.common.Sort;
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

    public List<SimilarDieSearchResult> searchSimilarDies(DieSimilarSearchDao dieSimilarSearchDao, Float threshold)
            throws MalformedDieException {
        List<SimilarDieSearchResult> results = dieMatcher.searchSimilarDies(dieSimilarSearchDao.getDieData(),
                threshold);
        // TODO: save the research...
        return results;
    }

    public List<DieSearchResult> searchDies(DieSearchDao dieSearchDao, Float threshold)
            throws MalformedDieException {
        StringBuilder queryBuilder = new StringBuilder();
        Parameters params = new Parameters();
        Sort sort = Sort.by("name");

        if (!dieSearchDao.getNames().isEmpty()) {
            queryBuilder.append("name IN :names");
            queryBuilder.append(" AND aliases IN :names");
            params.and("names", dieSearchDao.getNames());
        }
        if (!dieSearchDao.getCustomers().isEmpty()) {
            queryBuilder.append(" AND customer IN :customers");
            params.and("customers", dieSearchDao.getCustomers());
        }
        if (!dieSearchDao.getDieTypes().isEmpty()) {
            queryBuilder.append(" AND dieType IN :dieTypes");
            params.and("dieTypes", dieSearchDao.getDieTypes());
        }
        if (!dieSearchDao.getMaterials().isEmpty()) {
            queryBuilder.append(" AND material IN :materials");
            params.and("materials", dieSearchDao.getMaterials());
        }

        if (dieSearchDao.getTotalHeight() != null) {
            queryBuilder.append(" AND :totalHeight-1 <= totalHeight AND totalHeight <= :totalHeight+1");
            params.and("totalHeight", dieSearchDao.getTotalHeight());
        }
        if (dieSearchDao.getTotalWidth() != null) {
            queryBuilder.append(" AND :totalWidth-1 <= totalWidth AND totalWidth <= :totalWidth+1");
            params.and("totalWidth", dieSearchDao.getTotalWidth());
        }
        if (dieSearchDao.getShoeWidth() != null) {
            queryBuilder.append(" AND :shoeWidth-1 <= shoeWidth AND shoeWidth <= :shoeWidth+1");
            params.and("shoeWidth", dieSearchDao.getShoeWidth());
        }
        if (dieSearchDao.getCrestWidth() != null) {
            queryBuilder.append(" AND :crestWidth-1 <= crestWidth AND crestWidth <= :crestWidth+1");
            params.and("crestWidth", dieSearchDao.getCrestWidth());
        }

        if (dieSearchDao.getDieData() != null) {

        }
        // List<DieSearchResult> results =
        // dieMatcher.searchSimilarDies(dieSearchDao.getDieData(),
        // threshold);
        return Die.stream(queryBuilder.toString(), sort, params).map(e -> new DieSearchResult((Die) e)).toList();
    }

    public Optional<Die> findDie(Long id) {
        return Die.findByIdOptional(id);
    }
}
