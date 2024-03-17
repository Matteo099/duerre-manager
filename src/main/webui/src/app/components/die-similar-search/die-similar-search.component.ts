import { AsyncPipe, NgClass, NgStyle } from '@angular/common';
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
import { Die } from '../../models/entities/die';

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
    ReactiveFormsModule,
    NgStyle,
    NgClass
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
    name: [null as (string | null)],
  });
  imageURL: string = "/assets/images/milling.png";

  similarDies?: (SimilarDieSearchResult & { name?: string, img?: string })[];
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
    this.dieService.searchSimilarDies(dieSearch).subscribe(
      {
        next: (arr: SimilarDieSearchResult[]) => {
          this.similarDies = arr;
          this.similarDies.forEach(d => {
            this.dieService.get(d.dieId+"").subscribe({
              next: (die?: Die) => {
                if (!die) return;
                d.name = die.name;
                d.img = KonvaUtils.exportImage(die.dieData.state);
              }
            });
          })
        },
        complete: () => {
          this.searching = false;
        }
      });
  }

  getProgressbarColor(die: SimilarDieSearchResult): string {
    if (die.matchScore <= 0) {
      return "bg-success";
    } else if (die.matchScore < 1) {
      return "";
    } else if (die.matchScore < 5) {
      return "bg-info text-dark";
    } else if (die.matchScore < 10) {
      return "bg-warning text-dark";
    } else {
      return "bg-danger";
    }
  }

  getProgressbarWidth(die: SimilarDieSearchResult): number {
    if (die.matchScore <= 0) {
      return 100;
    } else if (die.matchScore < 1) {
      return 90 + (1 - die.matchScore) * 10;
    } else if (die.matchScore < 5) {
      return 75 + (die.matchScore - 1) * 15 / 4;
    } else if (die.matchScore < 10) {
      return 50 + (die.matchScore - 5) * 25 / 5;
    } else {
      return 25;
    }
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