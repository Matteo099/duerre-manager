package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieShapeExport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DieShapeExport implements IDieShapeExport<DieLineDao> {
    public List<DieLineDao> lines;
}
