package com.github.matteo099.model.interfaces;

import java.util.List;

public interface IDie {
    String getName();
    String getData();
    List<String> getAliases();
    IDieData getDieData();
    ICustomer getCustomer();
}
