import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MonacoEditorComponent } from './components/monaco-editor.component';
import { StorageService } from './services/storage.service';
import { SyncService } from './services/sync.service';

@NgModule({
  declarations: [
    AppComponent,
    MonacoEditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    StorageService,
    SyncService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }