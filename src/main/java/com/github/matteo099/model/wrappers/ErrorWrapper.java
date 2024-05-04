package com.github.matteo099.model.wrappers;

import jakarta.json.bind.annotation.JsonbTransient;

public class ErrorWrapper<E extends Exception> {
    @JsonbTransient
    public E exception;
    public String message;

    private ErrorWrapper(E exception) {
        this.exception = exception;
        this.message = exception.getMessage();
    }

    public static <E extends Exception> ErrorWrapper<E> of(E ex) {
        return new ErrorWrapper<E>(ex);
    }
}
