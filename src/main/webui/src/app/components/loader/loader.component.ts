import { Component } from '@angular/core';
import { Subject } from 'rxjs';
import { ProgressSpinnerMode, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from '../../services/loading.service';
import { AsyncPipe } from '@angular/common';


@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [MatProgressSpinnerModule, AsyncPipe],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  isLoading: Subject<boolean> = this.loadingService.isLoading;
  loadingMessage: Subject<string> = this.loadingService.loadingMessage;

  constructor(private loadingService: LoadingService) {
    this.loadingMessage.subscribe(s=>console.log(s));
  }
}
