package com.github.matteo099.model.dao;

import java.util.List;

import com.github.matteo099.model.interfaces.IDieLine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DieLineDao implements IDieLine {
    public String type;
    public List<Double> points;
}
