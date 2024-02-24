import { HttpClient } from "@angular/common/http";
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
        return (error: any | ErrorWrapper): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.notifyService.show(error.message, "Errore!");
            // this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }
}
