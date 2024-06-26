package com.github.matteo099.model.dao;

import java.util.LinkedList;
import java.util.List;

import org.bson.conversions.Bson;
import org.eclipse.microprofile.openapi.annotations.media.Schema;

import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.interfaces.IDieSearch;
import com.mongodb.client.model.Filters;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class DieSearchDao implements IDieSearch {
    public String text;
    public DieShapeExport dieData;
    public List<String> customers;
    public List<DieType> dieTypes;
    public List<MaterialType> materials;
    public Double totalHeight;
    public Double totalWidth;
    public Double shoeWidth;
    public Double crestWidth;

    @Schema(hidden = true)
    public List<Bson> getAllFilters() {
        var filters = new LinkedList<Bson>();
        filters.addAll(getTextFilters());
        filters.addAll(getCustomersFilters());
        filters.addAll(getDieTypesFilters());
        filters.addAll(getMaterialsFilters());
        filters.addAll(getTotalHeightFilters());
        filters.addAll(getTotalWidthFilters());
        filters.addAll(getShoeWidthFilters());
        filters.addAll(getCrestWidthFilters());
        return filters;
    }

    @Schema(hidden = true)
    public List<Bson> getTextFilters() {
        var filters = new LinkedList<Bson>();
        if (this.text != null) {
            String text = this.text.replaceAll(" ", "|");
            if (!text.isEmpty()) {
                filters.add(Filters.or(
                        Filters.regex("_id", text),
                        Filters.regex("aliases", text)));
            }
        }
        return filters;
    }

    @Schema(hidden = true)
    public List<Bson> getCustomersFilters() {
        if (customers == null || customers.isEmpty())
            return List.of();
        return List.of(Filters.in("customer._id", customers));
    }

    @Schema(hidden = true)
    public List<Bson> getDieTypesFilters() {
        if (dieTypes == null || dieTypes.isEmpty())
            return List.of();
        return List.of(Filters.in("dieType", dieTypes.stream().map(t -> t.name()).toList()));
    }

    @Schema(hidden = true)
    public List<Bson> getMaterialsFilters() {
        if (materials == null || materials.isEmpty())
            return List.of();
        return List.of(Filters.in("material", materials.stream().map(m -> m.name()).toList()));
    }

    @Schema(hidden = true)
    public List<Bson> getTotalHeightFilters() {
        if (totalHeight == null)
            return List.of();
        return getNumericFilter("totalHeight", totalHeight);
    }

    @Schema(hidden = true)
    public List<Bson> getTotalWidthFilters() {
        if (totalWidth == null)
            return List.of();
        return getNumericFilter("totalWidth", totalWidth);
    }

    @Schema(hidden = true)
    public List<Bson> getShoeWidthFilters() {
        if (shoeWidth == null)
            return List.of();
        return getNumericFilter("shoeWidth", shoeWidth);
    }

    @Schema(hidden = true)
    public List<Bson> getCrestWidthFilters() {
        if (crestWidth == null)
            return List.of();
        return getNumericFilter("crestWidth", crestWidth);
    }

    private List<Bson> getNumericFilter(String fieldName, Double number) {
        return List.of(Filters.and(
                Filters.gte(fieldName, number - 1),
                Filters.lte(fieldName, number + 1)));
    }
}
