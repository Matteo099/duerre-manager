import { Injectable, inject } from '@angular/core';
import {
  MatSnackBar
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {

  private snackBar = inject(MatSnackBar);

  public show(message: string, title: string = 'Attenzione') {
    this.snackBar.open(message, title, {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3000
    });
  }
}
