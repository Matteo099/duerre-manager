import { AsyncPipe } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { DieService } from '../../services/rest/die.service';
import { DieDataDao } from '../../models/dao/die-data-dao';
import { DieCreatorComponent, validDieValidator } from '../../die-creator/die-creator.component';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { KonvaUtils } from '../../die-creator/manager/konva-utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DieSimilarSearchDao } from '../../models/dao/die-similar-search-dao';
import { SimilarDieSearchResult } from '../../models/projections/similar-die-search-result';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-die-similar-search',
  standalone: true,
  imports: [
    AsyncPipe,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './die-similar-search.component.html',
  styleUrl: './die-similar-search.component.scss'
})
export class DieSimilarSearchComponent implements OnInit {

  private fb = inject(FormBuilder);
  private dieService = inject(DieService);
  public dialog = inject(MatDialog);

  addressForm = this.fb.group({
    dieData: [null as (DieDataDao | null), [Validators.required, validDieValidator()]],
    name: [null as (string | null), Validators.required],
  });
  imageURL: string = "/assets/images/milling.png";

  similarDies?: Observable<SimilarDieSearchResult[]>;
  searching = false;

  ngOnInit(): void {
    this.openDialog();
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
      if (result?.state) {
        this.imageURL = KonvaUtils.exportImage(result.state);
        this.openDialogGiveName();
      }
    });
  }

  private openDialogGiveName(): void {
    const dialogRef = this.dialog.open(SimpleDialogData, {
      data: this.addressForm.controls['name'].value
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      this.addressForm.controls['name'].setValue(result);
    });
  }

  onSubmit(): void {
    if (!this.addressForm.valid) {
      return;
    }

    this.searching = true;
    const dieSearch: DieSimilarSearchDao = {
      dieData: this.addressForm.controls['dieData'].value!,
      name: this.addressForm.controls['name'].value
    };

    // Search similar shapes!
    this.similarDies = this.dieService.searchSimilarDies(dieSearch).pipe(
      tap({
        complete: () => this.searching = false
      })
    );
  }
}

@Component({
  selector: 'simple-dialog-data',
  templateUrl: 'simple-dialog-data.html',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatButtonModule, MatDialogActions, MatDialogClose, FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class SimpleDialogData {
  nameFormControl = new FormControl(null as string | null, []);

  constructor(@Inject(MAT_DIALOG_DATA) public name: string | null) {
    this.nameFormControl.setValue(name);
  }
}