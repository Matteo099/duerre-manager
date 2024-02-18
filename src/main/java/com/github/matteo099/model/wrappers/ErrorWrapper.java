package com.github.matteo099.model.wrappers;

public class ErrorWrapper<E extends Exception> {
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
