package com.github.matteo099.updater;

import java.util.List;

public class Release {
    private String tag_name;
    private List<Asset> assets;
    
    protected Release() { }

    public String getTag_name() {
        return tag_name;
    }
    public void setTag_name(String tag_name) {
        this.tag_name = tag_name;
    }
    public List<Asset> getAssets() {
        return assets;
    }
    public void setAssets(List<Asset> assets) {
        this.assets = assets;
    }
}
