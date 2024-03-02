import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { NotifyService } from "../notify.service";
import { ErrorWrapper } from "../../models/wrappers/error-wrapper";

@Injectable({
    providedIn: 'root'
})
export class BaseRestService {

    protected http = inject(HttpClient);
    protected notifyService = inject(NotifyService);

    protected handleError<T>(operation = 'operation', result?: T) {
        return (error: HttpErrorResponse): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            const err = error.error as ErrorWrapper;
            const message = err?.message || error.message;
            // TODO: better job of transforming error for user consumption
            this.notifyService.show(message, "Errore!");
            // this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
