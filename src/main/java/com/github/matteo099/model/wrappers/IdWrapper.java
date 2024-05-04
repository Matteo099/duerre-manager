package com.github.matteo099.model.wrappers;

public class IdWrapper<T> {
    public T id;

    private IdWrapper(T id) {
        this.id = id;
    }

    public static <T> IdWrapper<T> of(T id) {
        return new IdWrapper<T>(id);
    }
}
