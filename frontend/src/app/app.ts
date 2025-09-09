import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeEditorComponent } from './components/code-editor.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CodeEditorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Code Sync - Real-time Code Sharing');
}
