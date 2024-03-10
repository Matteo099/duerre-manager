import { AsyncPipe, NgClass } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DieCreatorComponent } from '../../die-creator/die-creator.component';
import { KonvaUtils } from '../../die-creator/manager/konva-utils';
import { DieDataDao } from '../../models/dao/die-data-dao';
import { Customer } from '../../models/entities/customer';
import { Die } from '../../models/entities/die';
import { DieType, DieTypeHelper } from '../../models/entities/die.type';
import { MaterialType, MaterialTypeHelper } from '../../models/entities/material-type';
import { NotifyService } from '../../services/notify.service';
import { CustomerService } from '../../services/rest/customer.service';
import { DieService } from '../../services/rest/die.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { DieSearchDao } from '../../models/dao/die-search-dao';
import { DieSearchResult } from '../../models/projections/die-search-result';

@Component({
  selector: 'app-die-dashboard',
  templateUrl: './die-dashboard.component.html',
  styleUrl: './die-dashboard.component.scss',
  standalone: true,
  animations: [
    trigger('advancedSearchTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
  ],
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
    ReactiveFormsModule,
    NgClass
  ]
})
export class DieDashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dieService = inject(DieService);
  private customerService = inject(CustomerService);
  private notifyService = inject(NotifyService);
  public dialog = inject(MatDialog);

  gridView: boolean = true;
  dies!: Observable<(Die & { img: string })[]>;
  imageURL: string = "/assets/images/milling.png";

  addOnBlur = true;
  customerList: string[] = [];

  advancedSearch = false;
  serachForm = this.fb.group({
    names: [[] as (string[])],
    dieData: [null as (DieDataDao | null)],
    customers: [[] as (string[])],
    dieTypes: [[] as (string[] | DieType[])],
    materials: [[] as (string[] | MaterialType[])],
    totalHeight: [null as (number | null), [Validators.min(0)]],
    totalWidth: [null as (number | null), [Validators.min(0)]],
    shoeWidth: [null as (number | null), [Validators.min(0)]],
    crestWidth: [null as (number | null), [Validators.min(0)]],
  });

  MaterialTypeHelper = MaterialTypeHelper;
  DieTypeHelper = DieTypeHelper;

  ngOnInit(): void {
    this.dies = this.dieService.list().pipe(
      map((val, i) => {
        console.log(val);
        return val.map((die: Die) => {
          return { ...die, img: KonvaUtils.exportImage(die.dieData.state) };
        });
      })
    );

    this.customerService.list().subscribe({
      next: (c: Customer[]) => {
        this.customerList = c.map(o => o.name);
        this.serachForm.controls["customers"].updateValueAndValidity();
      }
    });
  }

  openDialog(): void {
    this.serachForm.controls['dieData'].markAsTouched()

    const dialogRef = this.dialog.open(DieCreatorComponent, {
      data: this.serachForm.controls['dieData'].value,
      width: "100%",
      height: "100%",
      maxWidth: "100vw"
    });

    dialogRef.afterClosed().subscribe((result: DieDataDao | null) => {
      console.log('The dialog was closed', result);
      this.serachForm.controls['dieData'].setValue(result);
      if (result?.state) {
        this.imageURL = KonvaUtils.exportImage(result.state);
      }
    });
  }

  performSearch() {
    const dieSearch: DieSearchDao = {
      text: this.serachForm.controls["names"].value,
      dieData: this.serachForm.controls["dieData"].value,
      customers: this.serachForm.controls["customers"].value,
      dieTypes: this.serachForm.controls["dieTypes"].value,
      materials: this.serachForm.controls["materials"].value,
      totalHeight: this.serachForm.controls["totalHeight"].value,
      totalWidth: this.serachForm.controls["totalWidth"].value,
      shoeWidth: this.serachForm.controls["shoeWidth"].value,
      crestWidth: this.serachForm.controls["crestWidth"].value,
    };
    console.log("Perform search ", dieSearch);
    this.dieService.searchDies(dieSearch).subscribe({
      next: (result: DieSearchResult[]) => {
        console.log(result);
      }
    });
  }

  clearSearch() {
    this.serachForm.reset();
  }
}