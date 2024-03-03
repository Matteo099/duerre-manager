package com.github.matteo099.model.interfaces;

import java.util.List;

public interface IDieData<D extends IDieDataShape> {
    List<D> getState(); 
}
