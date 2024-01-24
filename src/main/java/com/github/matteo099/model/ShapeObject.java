package com.github.matteo099.model;

import java.util.ArrayList;
import java.util.List;

public class ShapeObject {
    private String type;
    private String version;
    private String originX;
    private String originY;
    private int left;
    private int top;
    private int width;
    private int height;
    private String fill;
    private String stroke;
    private int strokeWidth;
    private Object strokeDashArray;
    private String strokeLineCap;
    private int strokeDashOffset;
    private String strokeLineJoin;
    private boolean strokeUniform;
    private int strokeMiterLimit;
    private int scaleX;
    private int scaleY;
    private int angle;
    private boolean flipX;
    private boolean flipY;
    private int opacity;
    private Object shadow;
    private boolean visible;
    private String backgroundColor;
    private String fillRule;
    private String paintFirst;
    private String globalCompositeOperation;
    private int skewX;
    private int skewY;
    private List<ShapePoint> points = new ArrayList<>();

    public ShapeObject() {
    }

    public ShapeObject(List<ShapePoint> points) {
        this.points = points;
    }

    public List<ShapePoint> getPoints() {
        return points;
    }

    public void setPoints(List<ShapePoint> points) {
        this.points = points;
    }

    public void normalizePoints() {
        int minX = points.stream().mapToInt(ShapePoint::getX).min().orElse(0);
        int minY = points.stream().mapToInt(ShapePoint::getY).min().orElse(0);
        for (ShapePoint point : points) {
            point.subX(minX);
            point.subY(minY);
        }
    }
}
