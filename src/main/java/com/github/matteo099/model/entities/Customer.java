package com.github.matteo099.model.entities;

import org.bson.codecs.pojo.annotations.BsonId;

import com.github.matteo099.model.interfaces.ICustomer;

import io.quarkus.mongodb.panache.PanacheMongoEntityBase;
import io.quarkus.mongodb.panache.common.MongoEntity;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@MongoEntity(collection = "customer")
@RegisterForReflection
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer extends PanacheMongoEntityBase implements ICustomer {
    
    @BsonId
    private String name;

    public Customer(ICustomer customer) {
        this.name = customer.getName();
    }
}
