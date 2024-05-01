package com.github.matteo099.model.projections;

import java.time.LocalDateTime;
import java.util.List;

import org.bson.codecs.pojo.annotations.BsonId;

import com.github.matteo099.model.dao.DieSearchDao;
import com.github.matteo099.model.entities.Customer;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.entities.DieData;
import com.github.matteo099.model.entities.DieType;
import com.github.matteo099.model.entities.MaterialType;
import com.github.matteo099.model.interfaces.IDie;

import io.quarkus.mongodb.panache.common.ProjectionFor;
import io.quarkus.runtime.annotations.RegisterForReflection;
import io.smallrye.mutiny.tuples.Tuple2;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@RegisterForReflection
@Getter
@Setter
@ToString
@ProjectionFor(Die.class)
public class CompleteDieSearchResult
        implements IDie<DieData, Customer>, IDieSearchResult<DieData>, Comparable<IDieSearchResult<?>> {

    @BsonId
    private String name;
    private List<String> aliases;
    private DieData dieData;
    private Customer customer;
    private DieType dieType;
    private MaterialType material;
    private Double totalHeight;
    private Double totalWidth;
    private Double shoeWidth;
    private Double crestWidth;
    private LocalDateTime creationDate;

    private Double textScore = 0d;
    private Double sizeScore = null;
    private Double matchScore = null;

    public void computeBaseScore(DieSearchDao search) {

        if (search.getText() != null) {
            var texts = search.getText().split(" ");
            for (String string : texts) {
                if (name.equals(string))
                    textScore += 0.5;
                else if (name.startsWith(string))
                    textScore += 0.25;
                else if (name.contains(string))
                    textScore += 0.1;

                aliases.forEach(a -> {
                    if (a.equals(string))
                        textScore += 0.5;
                    else if (a.startsWith(string))
                        textScore += 0.25;
                    else if (a.contains(string))
                        textScore += 0.1;
                });
            }
            if (textScore == 0)
                textScore = null;
        }

        var deltaTH = search.getTotalHeight() == null ? 0 : Math.abs(totalHeight - search.getTotalHeight());
        var deltaTW = search.getTotalWidth() == null ? 0 : Math.abs(totalWidth - search.getTotalWidth());
        var deltaSW = search.getShoeWidth() == null ? 0 : Math.abs(shoeWidth - search.getShoeWidth());
        var deltaCW = search.getCrestWidth() == null ? 0 : Math.abs(crestWidth - search.getCrestWidth());
        this.sizeScore = deltaTH + deltaTW + deltaSW + deltaCW;
    }

    public Double getTotalScore() {
        return (this.matchScore == null ? 0d : this.matchScore) + (this.sizeScore == null ? 0d : this.sizeScore)
                + (this.textScore == null ? 0d : this.textScore);
    }

    @Override
    public int compareTo(IDieSearchResult<?> o) {
        if (o == null)
            return -1;

        var normalizedTextScore = getNormalizedScore(this.textScore, o.getTextScore());
        var normalizedSizeScore = getNormalizedScore(this.sizeScore, o.getSizeScore());
        var normalizedMatchScore = getNormalizedScore(this.matchScore, o.getMatchScore());
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
