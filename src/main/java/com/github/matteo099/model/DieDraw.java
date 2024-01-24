package com.github.matteo099.model;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public class DieDraw {
    private String version;
    private List<ShapeObject> objects = new ArrayList<>();
    private String background;

    public DieDraw() {
    }

    public DieDraw(String version, List<ShapeObject> objects, String background) {
        this.version = version;
        this.objects = objects;
        this.background = background;
    }

    public String getVersion() {
        return version;
    }

    public List<ShapeObject> getObjects() {
        return objects;
    }

    public String getBackground() {
        return background;
    }
    
    public void setVersion(String version) {
        this.version = version;
    }

    public void setObjects(List<ShapeObject> objects) {
        this.objects = objects;
    }

    public void setBackground(String background) {
        this.background = background;
    }

}
