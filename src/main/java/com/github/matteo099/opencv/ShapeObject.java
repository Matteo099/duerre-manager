package com.github.matteo099.opencv;

import java.util.List;

public class ShapeObject {
    public String type;
    public String version;
    public String originX;
    public String originY;
    public int left;
    public int top;
    public int width;
    public int height;
    public String fill;
    public String stroke;
    public int strokeWidth;
    public Object strokeDashArray;
    public String strokeLineCap;
    public int strokeDashOffset;
    public String strokeLineJoin;
    public boolean strokeUniform;
    public int strokeMiterLimit;
    public int scaleX;
    public int scaleY;
    public int angle;
    public boolean flipX;
    public boolean flipY;
    public int opacity;
    public Object shadow;
    public boolean visible;
    public String backgroundColor;
    public String fillRule;
    public String paintFirst;
    public String globalCompositeOperation;
    public int skewX;
    public int skewY;
    public List<ShapePoint> points;

    public void normalizePoints() {
        int minX = points.stream().mapToInt(ShapePoint::getX).min().orElse(0);
        int minY = points.stream().mapToInt(ShapePoint::getY).min().orElse(0);
        for (ShapePoint point : points) {
            point.x -= minX;
            point.y -= minY;
        }
    }
}
