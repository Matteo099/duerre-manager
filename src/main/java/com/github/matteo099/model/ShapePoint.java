package com.github.matteo099.model;

public class ShapePoint {
    private int x;
    private int y;

    public ShapePoint() {

    }

    public ShapePoint(int x, int y) {
        this.x = x;
        this.y = y;
    }

    public void subX(int v) {
        x -= v;
    }

    public void subY(int v) {
        y -= v;
    }

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }
}
