import { Component, inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Route, Router, RouterLink, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { DieCreatorComponent } from '../../die-creator/die-creator.component';
import { DieService } from '../../services/die.service';
import { DieDao } from '../../models/dao/die-dao';


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
    MatIconModule
  ]
})
export class DieEditorComponent {

  private fb = inject(FormBuilder);
  addressForm = this.fb.group({
    name: [null, Validators.required],
    dieData: [null], //, Validators.required
    data: null,
  });

  constructor(
    public dialog: MatDialog,
    private dieService: DieService,
    private router: Router
  ) { }

  openDialog(): void {
    this.addressForm.controls['dieData'].markAsTouched()

    const dialogRef = this.dialog.open(DieCreatorComponent, {
      data: { name: "name", animal: "animal" },
      width: "100%",
      height: "100%",
      maxWidth: "100vw"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);
      this.addressForm.controls['dieData'].setValue(result);
    });
  }

  onSubmit(): void {
    if (!this.addressForm.valid) {
      return;
    }

    const die: DieDao = {
      name: this.addressForm.controls['name'].value!,
      dieData: this.addressForm.controls['dieData'].value!,
      data: this.addressForm.controls['data'].value
    };
    this.dieService.create(die).subscribe({
      next: (idW) => {
        console.log(idW);
        //this.router.navigate(['/die/' + idW.id])
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
