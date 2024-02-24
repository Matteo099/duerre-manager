import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DieDao } from '../../models/dao/die-dao';
import { IdWrapper } from '../../models/wrappers/id-wrapper';
import { LoadingService } from '../loading.service';
import { Die } from '../../models/entities/die';
import { BaseRestService } from './base-rest.service';
import { DieSimilarSearchDao } from '../../models/dao/die-similar-search-dao';
import { SimilarDieSearchResult } from '../../models/projections/similar-die-search-result';

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

  get(dieId: number): Observable<Die | undefined> {
    return this.http.get<Die>(DieService.DIE_URL + "/die/" + dieId).pipe(
      catchError(this.handleError<Die | undefined>('getDie', undefined))
    );
  }

  searchSimilarDies(dieSimilarSearch: DieSimilarSearchDao): Observable<SimilarDieSearchResult[]> {
    return this.http.put<SimilarDieSearchResult[]>(DieService.DIE_URL + "/search-similar-dies", dieSimilarSearch, {
      headers: LoadingService.generateHeader("Ricerca stampi simili in corso")
    }).pipe(
      catchError(this.handleError<SimilarDieSearchResult[]>('searchSimilarShapes', []))
    );
  }
}
