import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DieDao } from '../models/dao/die-dao';
import { IdWrapper } from '../models/wrappers/id-wrapper';
import { LoadingService } from './loading.service';
import { Die } from '../models/entities/die';

@Injectable({
  providedIn: 'root'
})
export class DieService {

  public static readonly DIE_URL = environment.baseUrl + "/die-controller";

  constructor(
    private http: HttpClient
  ) { }

  create(die: DieDao): Observable<IdWrapper> {
    return this.http.post<IdWrapper>(DieService.DIE_URL + "/create-die", die, {
      headers: LoadingService.generateHeader("Creazione stampo in corso")
    }).pipe(
      catchError(this.handleError<IdWrapper>('createDie', { id: undefined }))
    );
  }

  list(): Observable<Die[]> {
    return this.http.get<Die[]>(DieService.DIE_URL + "/list-dies").pipe(
      catchError(this.handleError<Die[]>('listDies', []))
    );
  }

  /**
 * Handle Http operation that failed.
 * Let the app continue.
 *
 * @param operation - name of the operation that failed
 * @param result - optional value to return as the observable result
 */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      // this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
