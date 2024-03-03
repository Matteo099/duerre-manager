package com.github.matteo099.model.entities;

import java.util.ArrayList;
import java.util.List;

import com.github.matteo099.model.interfaces.IDieData;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RegisterForReflection
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DieData implements IDieData<DieDataShape> {

    private List<DieDataShape> state = new ArrayList<>();

    public DieData(IDieData<?> dieData) {
        dieData.getState().forEach(s -> state.add(new DieDataShape(s)));
    }
}
