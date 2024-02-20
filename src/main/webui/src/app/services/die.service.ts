import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DieDao } from '../models/dao/die-dao';
import { IdWrapper } from '../models/wrappers/id-wrapper';
import { LoadingService } from './loading.service';

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
    });
  }

  list(): Observable<DieDao> {
    return this.http.get<DieDao>(DieService.DIE_URL + "/dies");
  }
}
