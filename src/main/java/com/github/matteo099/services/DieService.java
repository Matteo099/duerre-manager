package com.github.matteo099.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import com.github.matteo099.exceptions.DieAlreadyExists;
import com.github.matteo099.exceptions.MalformedDieException;
import com.github.matteo099.model.dao.DieDao;
import com.github.matteo099.model.dao.DieDataDao;
import com.github.matteo099.model.dao.DieDataShapeDao;
import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
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

    public Optional<Die> findDie(String id) {
        return Die.findByIdOptional(id);
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

        private static DieDataDao randomDieDataDao() {
            int numShapes = random.nextInt(5) + 1; // Random number of shapes, at least 1
            List<DieDataShapeDao> shapes = new ArrayList<>();
            for (int i = 0; i < numShapes; i++) {
                shapes.add(randomDieDataShapeDao());
            }
            return DieDataDao.builder().state(shapes).build();
        }

        private static DieDataShapeDao randomDieDataShapeDao() {
            String type = randomShapeType();
            List<Double> points = new ArrayList<>();
            for (int i = 0; i < (type == "line" ? 4 : 6); i++) {
                points.add(random.nextDouble() * 100);
            }
            return DieDataShapeDao.builder().type(type).points(points).build();
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
}
