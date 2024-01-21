import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DieEditorComponent } from './die-editor/die-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DieEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'webui';
}
