import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DieDao } from '../../models/dao/die-dao';
import { IdWrapper } from '../../models/wrappers/id-wrapper';
import { LoadingService } from '../loading.service';
import { Die } from '../../models/entities/die';
import { BaseRestService } from './base-rest.service';

@Injectable({
  providedIn: 'root'
})
export class DieService extends BaseRestService {

  public static readonly DIE_URL = environment.baseUrl + "/die-controller";

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
}
