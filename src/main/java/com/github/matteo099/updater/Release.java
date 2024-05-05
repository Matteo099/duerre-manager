package com.github.matteo099.updater;

import java.util.List;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@RegisterForReflection
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Release {
    private String url;
    private String assets_url;
    private String upload_url;
    private String html_url;
    private long id;
    private String node_id;
    private String tag_name;
    private String target_commitish;
    private String name;
    private boolean draft;
    private boolean prerelease;
    private String created_at;
    private String published_at;
    private List<Asset> assets;
    private String tarball_url;
    private String zipball_url;
    private String body;
    private int mentions_count;

}
