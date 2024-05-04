package com.github.matteo099.model.wrappers;

public class MessageWrapper<T> {
    public T message;

    private MessageWrapper(T message) {
        this.message = message;
    }

    public static <T> MessageWrapper<T> of(T message) {
        return new MessageWrapper<T>(message);
    }
}
