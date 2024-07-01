package com.github.matteo099.services;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import org.bson.conversions.Bson;
import org.bson.types.ObjectId;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.exceptions.MalformedDieException;
import com.github.matteo099.model.dao.DieDao;
import com.github.matteo099.model.dao.DieLineDao;
import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.dao.DieShapeExport;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.entities.DieSearch;
import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.entities.Order;
import com.github.matteo099.model.interfaces.IDie;
import com.github.matteo099.model.interfaces.IDieSearch;
import com.github.matteo099.model.projections.CompleteDieSearchResult;
import com.github.matteo099.model.projections.DieAggregationResult;
import com.github.matteo099.model.projections.IDieSearchResult;
import com.github.matteo099.opencv.DieMatcher;
import com.mongodb.client.model.Accumulators;
import com.mongodb.client.model.Aggregates;
import com.mongodb.client.model.Filters;

import io.quarkus.panache.common.Page;
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

    public String editDie(IDie<?, ?> iDie) throws DieAlreadyExists {
        deleteDie(iDie.getName());
        return createDie(iDie);
    }

    public List<Die> listDies() {
        return Die.listAll();
    }

    public boolean existsDie(String name) {
        return Die.findByIdOptional(name).isPresent();
    }

    public List<? extends IDieSearchResult<?>> searchDies(DieSearchDao dieSearchDao, Float threshold)
            throws MalformedDieException {

        var allFilters = dieSearchDao.getAllFilters();
        var filter = allFilters.isEmpty() ? null : Filters.and(allFilters).toBsonDocument().toString();
        var diesByProperties = (filter == null ? Die.findAll() : Die.find(filter))
                .project(CompleteDieSearchResult.class)
                .stream()
                .peek(e -> e.computeBaseScore(dieSearchDao))
                .toList();

        var result = dieMatcher.searchSimilarDiesFrom(dieSearchDao.getDieData(), threshold, diesByProperties)
                .stream()
                .sorted()
                .collect(Collectors.toList());
        // Collections.reverse(result);

        saveSearch(dieSearchDao);

        return result;
    }

    public void saveSearch(DieSearchDao dieSearchDao) {
        var savedDieSearch = findSearch(dieSearchDao);
        DieSearch dieSearch;
        if (savedDieSearch.isPresent()) {
            dieSearch = savedDieSearch.get();
            dieSearch.setSearchDate(LocalDateTime.now());
            dieSearch.update();
        } else {
            dieSearch = new DieSearch(dieSearchDao);
            dieSearch.persist();
        }
    }

    public List<DieSearch> getSearches(Integer pageSize) {
        return DieSearch.findAll(Sort.descending("searchDate")).page(Page.ofSize(pageSize)).list();
    }

    public Optional<DieSearch> findSearch(IDieSearch dieSearch) {
        LinkedList<Bson> allFilters = new LinkedList<>();
        if (dieSearch.getText() != null)
            allFilters.add(Filters.eq("text", dieSearch.getText()));
        if (dieSearch.getCustomers() != null && !dieSearch.getCustomers().isEmpty())
            allFilters.add(Filters.in("customers", dieSearch.getCustomers()));
        if (dieSearch.getMaterials() != null && !dieSearch.getMaterials().isEmpty())
            allFilters.add(Filters.in("materials", dieSearch.getMaterials()));
        if (dieSearch.getDieTypes() != null && !dieSearch.getDieTypes().isEmpty())
            allFilters.add(Filters.in("dieTypes", dieSearch.getDieTypes()));
        if (dieSearch.getTotalHeight() != null)
            allFilters.add(Filters.in("totalHeight", dieSearch.getTotalHeight()));
        if (dieSearch.getTotalWidth() != null)
            allFilters.add(Filters.in("totalWidth", dieSearch.getTotalWidth()));
        if (dieSearch.getShoeWidth() != null)
            allFilters.add(Filters.in("shoeWidth", dieSearch.getShoeWidth()));
        if (dieSearch.getCrestWidth() != null)
            allFilters.add(Filters.in("crestWidth", dieSearch.getCrestWidth()));
        if (allFilters.isEmpty())
            return Optional.empty();
        return DieSearch.find(Filters.and(allFilters).toBsonDocument().toString()).firstResultOptional();
    }

    public Optional<Die> findDie(String id) {
        return Die.findByIdOptional(id);
    }

    public boolean deleteDie(String id) {
        return Die.deleteById(id);
    }

    public boolean deleteSearch(String id) {
        return DieSearch.deleteById(new ObjectId(id));
    }

    public class RandomDieService {

        private static final Random random = new Random();

        public void saveRamdonDies(int number) throws DieAlreadyExists {
            for (int i = 0; i < number; i++) {
                var dieDao = randomDieDao(i);
                dieDao.name += i;
                String id = createDie(dieDao);
                System.out.println("Saving " + id + " - " + i + "/" + number);
            }
        }

        private static String randomString(int length) {
            int leftLimit = 97; // letter 'a'
            int rightLimit = 122; // letter 'z'
            StringBuilder buffer = new StringBuilder(length);
            for (int i = 0; i < length; i++) {
                int randomLimitedInt = leftLimit + (int) (random.nextFloat() * (rightLimit - leftLimit + 1));
                buffer.append((char) randomLimitedInt);
            }
            return buffer.toString();
        }

        private static DieShapeExport randomDieDataDao() {
            int numShapes = random.nextInt(5) + 1; // Random number of shapes, at least 1
            List<DieLineDao> lines = new ArrayList<>();
            for (int i = 0; i < numShapes; i++) {
                lines.add(randomDieDataShapeDao());
            }
            return DieShapeExport.builder().lines(lines).build();
        }

        private static DieLineDao randomDieDataShapeDao() {
            String type = randomShapeType();
            List<Double> points = new ArrayList<>();
            for (int i = 0; i < (type == "line" ? 4 : 6); i++) {
                points.add(random.nextDouble() * 100);
            }
            return DieLineDao.builder().type(type).points(points).build();
        }

        private static String randomShapeType() {
            String[] types = { "line", "bezier" }; // Example shape types
            return types[random.nextInt(types.length)];
        }

        private static DieDao randomDieDao(int seed) {
            int numAliases = random.nextInt(5); // Random number of aliases, up to 4
            List<String> aliases = new ArrayList<>();
            for (int i = 0; i < numAliases; i++) {
                aliases.add(randomString(8)); // Generate random alias with length 8
            }

            return DieDao.builder()
                    .name(randomString(4))
                    .dieData(randomDieDataDao()) // Assuming you have a default constructor for DieDataDao
                    .customer(randomString(8))
                    .aliases(aliases)
                    .dieType(DieType.values()[random.nextInt(DieType.values().length)])
                    .material(MaterialType.values()[random.nextInt(MaterialType.values().length)])
                    .totalHeight(random.nextDouble() * 8)
                    .totalWidth(random.nextDouble() * 8)
                    .shoeWidth(random.nextDouble() * 8)
                    .crestWidth(random.nextDouble() * 8)
                    .build();
        }

    }

    public Long getCount() {
        return Die.count();
    }

    public List<DieAggregationResult> getMaterialDistribution() {
        return getDistribution("material");
    }

    public List<DieAggregationResult> getTypeDistribution() {
        return getDistribution("dieType");
    }

    private List<DieAggregationResult> getDistribution(String field) {
        Bson groupStage = Aggregates.group("$" + field, Accumulators.sum("count", 1));
        List<Bson> pipeline = Arrays.asList(groupStage);
        var aggregation = Order.mongoCollection().aggregate(pipeline, DieAggregationResult.class);
        return StreamSupport.stream(aggregation.spliterator(), false).toList();
    }
}
