import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Customer } from '../../models/entities/customer'
import { BaseRestService } from './base-rest.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends BaseRestService {

  public static readonly CUSTOMER_URL = environment.baseUrl + "/customer-controller";

  list(): Observable<Customer[]> {
    return this.http.get<Customer[]>(CustomerService.CUSTOMER_URL + "/list-customers").pipe(
      catchError(this.handleError<Customer[]>('listCustomers', []))
    );
  }
}
