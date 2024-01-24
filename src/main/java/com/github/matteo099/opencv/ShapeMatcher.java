package com.github.matteo099.opencv;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.jboss.logging.Logger;
import org.opencv.core.MatOfPoint;
import org.opencv.core.Point;
import org.opencv.imgproc.Imgproc;

import com.github.matteo099.model.DieDraw;
import com.github.matteo099.model.ShapeObject;
import com.github.matteo099.model.ShapePoint;
import com.indvd00m.ascii.render.Region;
import com.indvd00m.ascii.render.Render;
import com.indvd00m.ascii.render.api.ICanvas;
import com.indvd00m.ascii.render.api.IContextBuilder;
import com.indvd00m.ascii.render.api.IRender;
import com.indvd00m.ascii.render.elements.Line;
import com.indvd00m.ascii.render.elements.Rectangle;
import com.indvd00m.ascii.render.elements.plot.Axis;
import com.indvd00m.ascii.render.elements.plot.AxisLabels;
import com.indvd00m.ascii.render.elements.plot.Plot;
import com.indvd00m.ascii.render.elements.plot.api.IPlotPoint;
import com.indvd00m.ascii.render.elements.plot.misc.PlotPoint;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import nu.pattern.OpenCV;

@ApplicationScoped
public class ShapeMatcher {

    @Inject
    Logger logger;

    static {
        OpenCV.loadLocally();
    }

    private List<DieDraw> getSavedDies() {
        return IntStream.range(0, 5000)
                .mapToObj(i -> generateRandomDie())
                .collect(Collectors.toList());
    }

    private DieDraw generateRandomDie() {
        var points = new ArrayList<ShapePoint>();
        var rnd = new Random();
        for (int i = 0; i < rnd.nextInt(20) + 3; i++) {
            points.add(new ShapePoint(rnd.nextInt(300), rnd.nextInt(300)));
        }

        var die = new DieDraw();
        die.getObjects().add(new ShapeObject(points));
        return die;
    }

    public MatOfPoint extractContourn(DieDraw dieDraw) {
        List<Point> points = new ArrayList<>();
        for (ShapeObject object : dieDraw.getObjects()) {
            object.normalizePoints();
            for (ShapePoint point : object.getPoints()) {
                points.add(new Point(point.getX(), point.getY()));
            }
        }
        MatOfPoint contour = new MatOfPoint();
        contour.fromList(points);
        return contour;
    }

    public List<DieDraw> findSimilarShapes(DieDraw dieDraw, float threshold) {
        var dieDrawContour = extractContourn(dieDraw);
        var similarDies = new ArrayList<DieDraw>();
        var dies = getSavedDies();

        for (DieDraw savedDie : dies) {
            MatOfPoint savedDieContourn = extractContourn(savedDie);

            // Compare the shape with the set using matchShape
            double matchScore = Imgproc.matchShapes(dieDrawContour, savedDieContourn,
                    Imgproc.CV_CONTOURS_MATCH_I1, 0.0);

            // logger.info(matchScore);
            // You can adjust the threshold based on your requirements
            if (matchScore < threshold) {
                // Shapes are considered similar (you can adjust the threshold)
                similarDies.add(savedDie);
                this.drawDieAsPolygon(savedDieContourn);
                this.drawDieAsPolygon(dieDrawContour);
                //this.drawDieAsPoint(savedDieContourn);
            }
        }

        return similarDies;
    }

    public static String getDie(ShapePoint a, ShapePoint b, ShapePoint c) {
        return String.format("""
                {
                    "version": "5.3.0",
                    "objects": [
                      {
                        "type": "polygon",
                        "version": "5.3.0",
                        "originX": "left",
                        "originY": "top",
                        "left": 0,
                        "top": 0,
                        "width": 120,
                        "height": 100,
                        "fill": "white",
                        "stroke": "#000",
                        "strokeWidth": 2,
                        "strokeDashArray": null,
                        "strokeLineCap": "butt",
                        "strokeDashOffset": 0,
                        "strokeLineJoin": "miter",
                        "strokeUniform": false,
                        "strokeMiterLimit": 4,
                        "scaleX": 1,
                        "scaleY": 1,
                        "angle": 0,
                        "flipX": false,
                        "flipY": false,
                        "opacity": 1,
                        "shadow": null,
                        "visible": true,
                        "backgroundColor": "",
                        "fillRule": "nonzero",
                        "paintFirst": "fill",
                        "globalCompositeOperation": "source-over",
                        "skewX": 0,
                        "skewY": 0,
                        "points": [
                          { "x": %d, "y": %d },
                          { "x": %d, "y": %d },
                          { "x": %d, "y": %d }
                        ]
                      }
                    ],
                    "background": "black"
                }
                """, a.getX(), a.getY(), b.getX(), b.getY(), c.getX(), c.getY());
    }

    private void drawDieAsPoint(MatOfPoint matOfPoints) {
        List<IPlotPoint> points = matOfPoints.toList().stream().map(p -> {
            IPlotPoint plotPoint = new PlotPoint(p.x, p.y);
            return plotPoint;
        }).toList();
        IRender render = new Render();
        IContextBuilder builder = render.newBuilder();
        builder.width(80).height(20);
        builder.element(new Rectangle(0, 0, 80, 20));
        builder.layer(new Region(1, 1, 78, 18));
        builder.element(new Axis(points, new Region(0, 0, 78, 18)));
        builder.element(new AxisLabels(points, new Region(0, 0, 78, 18)));
        builder.element(new Plot(points, new Region(0, 0, 78, 18)));
        ICanvas canvas = render.render(builder.build());
        String s = canvas.getText();
        System.out.println(s);
    }

    private void drawDieAsPolygon(MatOfPoint matOfPoints) {
        var points = matOfPoints.toList();
        var maxX = points.stream().mapToDouble(p -> p.x).max().orElse(1) + 50;
        var maxY = points.stream().mapToDouble(p -> p.y).max().orElse(1) + 50;
        int w = 80;
        int h = 20;
        IRender render = new Render();
        IContextBuilder builder = render.newBuilder();
        builder.width(w).height(h);
        builder.element(new Rectangle());
        for (int i = 1; i < points.size(); i++) {
            var aCV = points.get(i - 1);
            var bCV = points.get(i);
            builder.element(
                    new Line(new com.indvd00m.ascii.render.Point((int) (aCV.x / maxX * w), (int) (aCV.y / maxY * h)),
                            new com.indvd00m.ascii.render.Point((int) (bCV.x / maxX * w), (int) (bCV.y / maxY * h))));
        }

        var aCV = points.get(points.size() - 1);
        var bCV = points.get(0);
        builder.element(
                new Line(new com.indvd00m.ascii.render.Point((int) (aCV.x / maxX * w), (int) (aCV.y / maxY * h)),
                        new com.indvd00m.ascii.render.Point((int) (bCV.x / maxX * w), (int) (bCV.y / maxY * h))));

        ICanvas canvas = render.render(builder.build());
        String s = canvas.getText();
        System.out.println(s);

    }

}