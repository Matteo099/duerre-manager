import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AsyncPipe, Location } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    AsyncPipe,
    LoaderComponent,
    RouterModule
  ]
})
export class AppComponent {

  @ViewChild("drawer") drawer: any;

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  private location = inject(Location);

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  navigate(path: string) {
    this.router.navigate([path]);
    this.drawer.toggle();
  }

  goBack() {
    this.location.back();
  }
}
