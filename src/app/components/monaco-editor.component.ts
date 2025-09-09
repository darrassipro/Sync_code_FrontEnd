import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';

declare const monaco: any;

@Component({
  selector: 'app-monaco-editor',
  template: `
    <div #editorContainer class="monaco-editor-container"></div>
  `,
  styles: [`
    .monaco-editor-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }
  `]
})
export class MonacoEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Input() content: string = '';
  @Input() language: string = 'javascript';
  @Input() readOnly: boolean = false;
  @Output() contentChange = new EventEmitter<string>();

  private editor: any;
  private isInitialized = false;

  ngOnInit(): void {
    this.initializeMonaco();
  }

  ngOnDestroy(): void {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private initializeMonaco(): void {
    // Load Monaco Editor from CDN if not already loaded
    if (typeof monaco === 'undefined') {
      this.loadMonacoFromCDN().then(() => {
        this.createEditor();
      });
    } else {
      this.createEditor();
    }
  }

  private loadMonacoFromCDN(): Promise<void> {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (document.getElementById('monaco-loader')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'monaco-loader';
      script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/loader.js';
      script.onload = () => {
        (window as any).require.config({
          paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' }
        });
        (window as any).require(['vs/editor/editor.main'], () => {
          resolve();
        });
      };
      document.head.appendChild(script);
    });
  }

  private createEditor(): void {
    if (this.isInitialized) return;

    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.content,
      language: this.language,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
      readOnly: this.readOnly,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true
    });

    // Listen for content changes
    this.editor.onDidChangeModelContent(() => {
      const value = this.editor.getValue();
      this.contentChange.emit(value);
    });

    this.isInitialized = true;
  }

  updateContent(content: string): void {
    if (this.editor && content !== this.editor.getValue()) {
      const position = this.editor.getPosition();
      this.editor.setValue(content);
      if (position) {
        this.editor.setPosition(position);
      }
    }
  }

  updateLanguage(language: string): void {
    if (this.editor && language !== this.language) {
      this.language = language;
      monaco.editor.setModelLanguage(this.editor.getModel(), language);
    }
  }

  focus(): void {
    if (this.editor) {
      this.editor.focus();
    }
  }

  getContent(): string {
    return this.editor ? this.editor.getValue() : '';
  }
}