package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieData;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DieDataDao implements IDieData<DieDataShapeDao> {
    public List<DieDataShapeDao> state;
}
