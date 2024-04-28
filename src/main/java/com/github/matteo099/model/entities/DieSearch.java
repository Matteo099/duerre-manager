package com.github.matteo099.model.entities;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.github.matteo099.model.interfaces.IDieSearch;

import io.quarkus.mongodb.panache.PanacheMongoEntity;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@MongoEntity(collection = "searches")
@RegisterForReflection
@Setter
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DieSearch extends PanacheMongoEntity implements IDieSearch {

    private String text;
    private DieData dieData;
    private List<String> customers;
    private List<DieType> dieTypes;
    private List<MaterialType> materials;
    private Double totalHeight;
    private Double totalWidth;
    private Double shoeWidth;
    private Double crestWidth;

    private String name;
    private LocalDateTime creationDate = LocalDateTime.now();

    public DieSearch(IDieSearch iDieSearch) {
        text = iDieSearch.getText();
        dieData = iDieSearch.getDieData() != null ? new DieData(iDieSearch.getDieData()) : null;
        customers = iDieSearch.getCustomers();
        dieTypes = iDieSearch.getDieTypes();
        materials = iDieSearch.getMaterials();
        totalHeight = iDieSearch.getTotalHeight();
        totalWidth = iDieSearch.getTotalWidth();
        shoeWidth = iDieSearch.getShoeWidth();
        crestWidth = iDieSearch.getCrestWidth();

        initName();
    }

    private void initName() {
        if (text != null)
            name = text;
        else if (customers != null && !customers.isEmpty())
            name = "Cliente: " + String.join(",", customers);
        else if (materials != null && !materials.isEmpty())
            name = "Materiale: " + materials.stream().map(t -> t.name()).collect(Collectors.joining(","));
        else if (dieTypes != null && !dieTypes.isEmpty())
            name = "Colore: " + dieTypes.stream().map(t -> t.name()).collect(Collectors.joining(","));
        else if (totalHeight != null || totalWidth != null || shoeWidth != null || crestWidth != null)
            name = "Dimensioni: " + numberOrInterrogationChar(totalHeight) + "x" + numberOrInterrogationChar(totalWidth)
                    + "x"
                    + numberOrInterrogationChar(shoeWidth) + "x" + numberOrInterrogationChar(crestWidth);
    }

    private String numberOrInterrogationChar(Number number) {
        return number != null ? number.toString() : "?";
    }
}