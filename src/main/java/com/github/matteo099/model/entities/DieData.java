package com.github.matteo099.model.entities;

import java.util.ArrayList;
import java.util.List;

import com.github.matteo099.model.interfaces.IDieShapeExport;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@RegisterForReflection
@Setter
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DieData implements IDieShapeExport<DieDataLine> {

    private List<DieDataLine> lines = new ArrayList<>();

    public DieData(IDieShapeExport<?> dieData) {
        dieData.getLines().forEach(s -> lines.add(new DieDataLine(s)));
    }
}
