package com.github.matteo099.model.entities;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.codecs.pojo.annotations.BsonId;

import com.github.matteo099.model.interfaces.IDie;

import io.quarkus.mongodb.panache.PanacheMongoEntityBase;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@MongoEntity(collection = "dies")
@RegisterForReflection
@Setter
@Getter
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Die extends PanacheMongoEntityBase implements IDie<DieData, Customer> {

    @BsonId
    private String name;
    private List<String> aliases;
    private DieData dieData;
    private Customer customer;
    private DieType dieType;
    private MaterialType material;
    private Double totalHeight;
    private Double totalWidth;
    private Double shoeWidth;
    private Double crestWidth;
    private LocalDateTime creationDate;

    public Die(IDie<?, ?> iDie, Customer customer) {
        name = iDie.getName();
        aliases = iDie.getAliases();
        dieData = new DieData(iDie.getDieData());
        this.customer = customer;

        dieType = iDie.getDieType();
        material = iDie.getMaterial();
        totalHeight = iDie.getTotalHeight();
        totalWidth = iDie.getTotalWidth();
        shoeWidth = iDie.getShoeWidth();
        crestWidth = iDie.getCrestWidth();
    }
}
