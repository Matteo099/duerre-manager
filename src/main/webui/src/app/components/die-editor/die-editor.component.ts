import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
  MatDialog
} from '@angular/material/dialog';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
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
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { NotifyService } from '../../services/notify.service';
import { DieType, DieTypeHelper } from '../../models/entities/die.type';
import { MaterialType, MaterialTypeHelper } from '../../models/entities/material-type';

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
    RouterModule,
    MatIconModule,
    AsyncPipe,
    MatAutocompleteModule,
    MatChipsModule
  ]
})
export class DieEditorComponent implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dieService = inject(DieService);
  private customerService = inject(CustomerService);
  private notifyService = inject(NotifyService);
  public dialog = inject(MatDialog);

  addressForm = this.fb.group({
    name: [null as (string | null), Validators.required],
    dieData: [null as (DieDataDao | null), [Validators.required, validDieValidator()]],
    alias: [],
    customer: [null as (string | null), [Validators.required, Validators.minLength(2)]],
    dieType: [null as (string | DieType | null), Validators.required],
    material: [null as (string | MaterialType | null), Validators.required],
    totalHeight: [null as (number | null), [Validators.required, Validators.min(0)]],
    totalWidth: [null as (number | null), [Validators.required, Validators.min(0)]],
    shoeWidth: [null as (number | null), [Validators.required, Validators.min(0)]],
    crestWidth: [null as (number | null), [Validators.required, Validators.min(0)]],
  });
  imageURL: string = "/assets/images/milling.png";

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  aliases: string[] = [];

  DieType = DieType;
  MaterialType = MaterialType;
  MaterialTypeHelper = MaterialTypeHelper;
  DieTypeHelper = DieTypeHelper;

  customers: Customer[] = [];
  filteredCustomers?: Observable<string[]>;

  ngOnInit(): void {
    this.customerService.list().subscribe({
      next: (c: Customer[]) => {
        this.customers = c;
        this.addressForm.controls['customer'].updateValueAndValidity();
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

    dialogRef.afterClosed().subscribe((result: DieDataDao | null) => {
      console.log('The dialog was closed', result);
      this.addressForm.controls['dieData'].setValue(result);
      if (result?.state) this.imageURL = KonvaUtils.exportImage(result.state);
    });
  }

  onSubmit(): void {
    if (!this.addressForm.valid) {
      return;
    }

    const die: DieDao = {
      name: this.addressForm.controls['name'].value!,
      dieData: this.addressForm.controls['dieData'].value!,
      aliases: this.aliases,
      customer: this.addressForm.controls['customer'].value!,
      dieType: this.addressForm.controls['dieType'].value! as DieType,
      material: this.addressForm.controls['material'].value! as MaterialType,
      totalHeight: this.addressForm.controls['totalHeight'].value!,
      totalWidth: this.addressForm.controls['totalWidth'].value!,
      shoeWidth: this.addressForm.controls['shoeWidth'].value!,
      crestWidth: this.addressForm.controls['crestWidth'].value!,
    };

    this.dieService.create(die).subscribe({
      next: (idW) => {
        if (idW.id !== undefined) this.router.navigate(['/die/' + idW.id])
      }
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (value) {
      this.aliases.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(alias: string): void {
    const index = this.aliases.indexOf(alias);

    if (index >= 0) {
      this.aliases.splice(index, 1);

      this.notifyService.show(`Alias '${alias}' rimosso`);
    }
  }

  edit(alias: string, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(alias);
      return;
    }

    // Edit existing fruit
    const index = this.aliases.indexOf(alias);
    if (index >= 0) {
      this.aliases[index] = value;
    }
  }
}
