package com.github.matteo099.model.interfaces;

import java.util.List;

public interface IDieShapeExport<D extends IDieLine> {
    List<D> getLines(); 
}
