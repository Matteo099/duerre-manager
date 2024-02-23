import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { KonvaUtils } from '../../die-creator/manager/konva-utils';
import { Die } from '../../models/entities/die';
import { DieService } from '../../services/rest/die.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomerService } from '../../services/rest/customer.service';
import { Customer } from '../../models/entities/customer';

@Component({
  selector: 'app-die-dashboard',
  templateUrl: './die-dashboard.component.html',
  styleUrl: './die-dashboard.component.scss',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DieDashboardComponent implements OnInit {
  private dieService = inject(DieService);
  private customerService = inject(CustomerService);

  gridView: boolean = true;
  dies!: Observable<(Die & { img: string })[]>;

  customers = new FormControl('');

  customerList: string[] = Array.from({ length: 10 }, (_, i) => "Cliente " + (i + 1));

  ngOnInit(): void {
    this.dies = this.dieService.list().pipe(
      map((val, i) => {
        return val.map((die: Die) => {
          return { ...die, img: KonvaUtils.exportImage(die.dieData.state) };
        });
      })
    );

    this.customerService.list().subscribe({
      next: (c: Customer[]) => {
        this.customerList = c.map(o => o.name);
        this.customers.updateValueAndValidity();
      }
    });
  }
}
