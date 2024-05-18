package com.github.matteo099.updater;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.Builder;
import lombok.Getter;

@RegisterForReflection
@Getter
@Builder
public class UpdateAvailable {
    private boolean available;
    private String version;
}
