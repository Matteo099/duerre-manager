package com.github.matteo099.opencv;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

import org.jboss.logging.Logger;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.imgproc.Imgproc;

import com.github.matteo099.exceptions.MalformedDieException;
import com.github.matteo099.model.entities.Die;
import com.github.matteo099.model.interfaces.IDieShapeExport;
import com.github.matteo099.model.projections.CompleteDieSearchResult;
import com.github.matteo099.model.projections.IDieSearchResult;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import nu.pattern.OpenCV;

@ApplicationScoped
public class DieMatcher {

    @Inject
    Logger logger;

    static {
        OpenCV.loadLocally();
    }

    public List<? extends IDieSearchResult<?>> searchSimilarDiesFrom(IDieShapeExport<?> dieData, float threshold,
            List<? extends IDieSearchResult<?>> savedDies)
            throws MalformedDieException {
        if (dieData == null) {
            return savedDies;
        }

        var dieDrawContour = extractContourn(dieData);
        if (dieDrawContour.isEmpty()) {
            throw new MalformedDieException("Malformed Die");
        }

        List<IDieSearchResult<?>> similarDies = new ArrayList<>();
        logger.info("Found " + savedDies.size() + " dies");

        for (var die : savedDies) {
            logger.debug("Comparing die " + die.getName());
            var savedDieContourn = extractContourn(die.getDieData());
            if (savedDieContourn.isEmpty()) {
                logger.warn("Die malformed, skipping; id=" + die.getName());
                continue;
            }

            // Compare the shape with the set using matchShape
            double matchScore = Imgproc.matchShapes(dieDrawContour.get(), savedDieContourn.get(),
                    Imgproc.CV_CONTOURS_MATCH_I1, 0.0);
            logger.debug("Match score is " + matchScore);

            // You can adjust the threshold based on your requirements
            if (matchScore < threshold) {
                // Shapes are considered similar (you can adjust the threshold)
                die.setMatchScore(matchScore);
                similarDies.add(die);
            }
        }

        return similarDies;
    }

    public List<? extends IDieSearchResult<?>> searchSimilarDies(IDieShapeExport<?> dieData, float threshold)
            throws MalformedDieException {
        List<CompleteDieSearchResult> list = Die.findAll().project(CompleteDieSearchResult.class).list();
        return this.searchSimilarDiesFrom(dieData, threshold, list);
    }

    public static Optional<MatOfPoint> extractContourn(IDieShapeExport<?> dieData) {
        var finalPoints = new LinkedList<Point>();
        double minX = Double.POSITIVE_INFINITY;
        double minY = Double.POSITIVE_INFINITY;
        for (var shape : dieData.getLines()) {
            if (shape.getType().equals("line")) {
                var points = shape.getPoints();
                if (points.size() != 4) {
                    return Optional.empty();
                }
                minX = Collections.min(List.of(minX, points.get(0), points.get(2)));
                minY = Collections.min(List.of(minY, points.get(1), points.get(3)));
                finalPoints.add(new Point(points.get(0), points.get(1)));
                finalPoints.add(new Point(points.get(2), points.get(3)));
            } else if (shape.getType().equals("bezier")) {
                var points = shape.getPoints();
                if (points.size() != 6) {
                    return Optional.empty();
                }

                minX = Collections.min(List.of(minX, points.get(0), points.get(4)));
                minY = Collections.min(List.of(minY, points.get(1), points.get(5)));
                finalPoints.addAll(new Quad(points).generateBezierPoints(50));
            }
        }

        // normalize points and create MatOfPoint
        MatOfPoint contour = new MatOfPoint();
        final double mX = minX;
        final double mY = minY;
        contour.fromList(finalPoints.stream().map(p -> {
            p.x -= mX;
            p.y -= mY;
            return p;
        }).toList());
        return Optional.of(contour);
    }

    static class Quad {
        public double startX;
        public double startY;
        public double controlX;
        public double controlY;
        public double endX;
        public double endY;

        public Quad(List<Double> points) {
            startX = points.get(0);
            startY = points.get(1);
            controlX = points.get(2);
            controlY = points.get(3);
            endX = points.get(4);
            endY = points.get(5);
        }

        public List<Point> generateBezierPoints(int numberOfPoints) {
            var points = new LinkedList<Point>();
            for (int t = 0; t <= numberOfPoints; t++) {
                Double delta = 1.0d / numberOfPoints;
                var x = Math.pow(1 - delta, 2) * this.startX + 2 * (1 - delta) * delta * this.controlX
                        + delta * delta * this.endX;
                var y = Math.pow(1 - delta, 2) * this.startY + 2 * (1 - delta) * delta * this.controlY
                        + delta * delta * this.endY;
                points.add(new Point(x, y));
            }
            return points;
        }
    }
}