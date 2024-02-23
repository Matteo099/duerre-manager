import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { DieCreatorComponent, validDieValidator } from '../../die-creator/die-creator.component';
import { DieDao } from '../../models/dao/die-dao';
import { DieService } from '../../services/rest/die.service';
import { KonvaUtils } from '../../die-creator/manager/konva-utils';
import { DieDataDao } from '../../models/dao/die-data-dao';
import { Observable, map, startWith } from 'rxjs';
import { CustomerService } from '../../services/rest/customer.service';
import { Customer } from '../../models/entities/customer';
import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-die-editor',
  templateUrl: './die-editor.component.html',
  styleUrl: './die-editor.component.scss',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatRadioModule,
    MatCardModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    AsyncPipe,
    MatAutocompleteModule
  ]
})
export class DieEditorComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dieService = inject(DieService);
  private customerService = inject(CustomerService);

  addressForm = this.fb.group({
    name: [null as (string | null), Validators.required],
    dieData: [null as (DieDataDao | null), [Validators.required, validDieValidator()]],
    customer: [null as (string | null), [Validators.required, Validators.minLength(2)]],
    data: null as (string | null),
  });
  imageURL: string = "/assets/images/milling.png";

  customers: Customer[] = [];
  filteredCustomers?: Observable<string[]>;

  constructor(
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.customerService.list().subscribe({
      next: (c: Customer[]) => {
        this.customers = c;
      }
    });

    this.filteredCustomers = this.addressForm.controls['customer'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.customers.filter(option => option.name.toLowerCase().includes(filterValue)).map(c => c.name);
  }

  openDialog(): void {
    this.addressForm.controls['dieData'].markAsTouched()

    const dialogRef = this.dialog.open(DieCreatorComponent, {
      data: this.addressForm.controls['dieData'].value,
      width: "100%",
      height: "100%",
      maxWidth: "100vw"
    });

    dialogRef.afterClosed().subscribe((result: DieDataDao) => {
      console.log('The dialog was closed', result);
      this.addressForm.controls['dieData'].setValue(result);
      this.imageURL = KonvaUtils.exportImage(result.state);
    });
  }

  onSubmit(): void {
    if (!this.addressForm.valid) {
      return;
    }

    const die: DieDao = {
      name: this.addressForm.controls['name'].value!,
      dieData: this.addressForm.controls['dieData'].value!,
      data: this.addressForm.controls['data'].value,
      customer: this.addressForm.controls['customer'].value!
    };

    this.dieService.create(die).subscribe({
      next: (idW) => {
        console.log(idW);
        if (idW.id !== undefined) this.router.navigate(['/die/' + idW.id])
      },
      error: (erW) => {
        console.log(erW);
      },
      complete: () => {
        console.log("COMPLETE!");
      }
    });
  }
}
