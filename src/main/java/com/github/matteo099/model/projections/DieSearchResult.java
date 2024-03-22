package com.github.matteo099.model.projections;

import com.github.matteo099.model.interfaces.IDie;

import io.quarkus.runtime.annotations.RegisterForReflection;
import io.smallrye.mutiny.tuples.Tuple2;
import lombok.Getter;
import lombok.ToString;

@RegisterForReflection
@Getter
@ToString
public class DieSearchResult implements Comparable<DieSearchResult>, IDieSearch {

    private String name;
    private Double textScore = null;
    private Double sizeScore = null;
    private Double matchScore = null;

    public DieSearchResult(IDie<?, ?> die) {
        this(die, null);
    }

    public DieSearchResult(IDie<?, ?> die, Double matchScore) {
        this(die.getName(), matchScore, null, null);
        if (die instanceof IDieSearch) {
            var sr = ((IDieSearch) die);
            this.textScore = sr.getTextScore();
            this.sizeScore = sr.getSizeScore();
            this.matchScore = matchScore == null ? sr.getMatchScore() : matchScore;
        }
    }

    public DieSearchResult(String name, Double matchScore, Double textScore, Double sizeScore) {
        this.name = name;
        this.matchScore = matchScore;
        this.textScore = textScore;
        this.sizeScore = sizeScore;
    }

    @Override
    public int compareTo(DieSearchResult o) {
        if (o == null)
            return -1;

        var normalizedTextScore = getNormalizedScore(this.textScore, o.textScore);
        var normalizedSizeScore = getNormalizedScore(this.sizeScore, o.sizeScore);
        var normalizedMatchScore = getNormalizedScore(this.matchScore, o.matchScore);
        return (normalizedTextScore.getItem1() + normalizedSizeScore.getItem1()
                - normalizedMatchScore.getItem1()) > (normalizedTextScore.getItem2() + normalizedSizeScore.getItem2()
                        - normalizedMatchScore.getItem2()) ? -1 : 1;
    }

    private Tuple2<Double, Double> getNormalizedScore(Double myScore, Double otherScore) {
        Double myComputedScore = 0d;
        Double otherComputedScore = 0d;

        if (myScore == null) {
            if (otherScore == null) {
                myComputedScore = 0d;
                otherComputedScore = 0d;
            } else {
                otherComputedScore = otherScore;
                myComputedScore = otherScore + 1;
            }
        } else {
            if (otherScore == null) {
                myComputedScore = myScore;
                otherComputedScore = myScore + 1;
            } else {
                myComputedScore = myScore;
                otherComputedScore = otherScore;
            }
        }

        return Tuple2.of(myComputedScore, otherComputedScore);
    }
}
