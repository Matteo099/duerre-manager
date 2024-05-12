package com.github.matteo099.updater;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.json.bind.annotation.JsonbTransient;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.ToString;

@RegisterForReflection
@Getter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
public class UpdateStatus {
    private UpdatePhase phase;
    private Double progress;
    private Boolean updating = false;
    private String error;

    @JsonbTransient
    private final Runnable onFieldChanged;

    public void setError(String error) {
        this.error = error;
        if (onFieldChanged != null)
            onFieldChanged.run();
    }

    public void setPhase(UpdatePhase phase) {
        this.phase = phase;
        if (onFieldChanged != null)
            onFieldChanged.run();
    }

    public void setProgress(Double progress) {
        this.progress = progress;
        if (onFieldChanged != null)
            onFieldChanged.run();
    }

    public void setUpdating(Boolean updating) {
        this.updating = updating;
        if (onFieldChanged != null)
            onFieldChanged.run();
    }
}