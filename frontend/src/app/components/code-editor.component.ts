import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SyncService, CodeSession } from '../services/sync.service';
import { Subscription } from 'rxjs';

declare const monaco: any;

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="editor-container">
      <div class="editor-header">
        <div class="session-info">
          <div class="session-id">
            <label>Session ID:</label>
            <input 
              type="text" 
              [(ngModel)]="sessionIdInput" 
              (keyup.enter)="joinSession()"
              placeholder="Enter session ID">
            <button (click)="joinSession()" [disabled]="!sessionIdInput.trim()">Join</button>
            <button (click)="createNewSession()">New Session</button>
          </div>
          <div class="current-session" *ngIf="currentSessionId">
            <span class="label">Current Session:</span>
            <span class="session-code">{{ currentSessionId }}</span>
            <span class="participants" *ngIf="currentSession">
              ({{ currentSession.participants }} participants)
            </span>
          </div>
        </div>
        <div class="sync-status">
          <span class="status-indicator" [class.online]="isOnline" [class.offline]="!isOnline">
            {{ isOnline ? 'Online' : 'Offline' }}
          </span>
          <span class="last-sync" *ngIf="lastSyncTime">
            Last sync: {{ lastSyncTime | date:'short' }}
          </span>
        </div>
      </div>
      
      <div class="editor-wrapper">
        <div #editorContainer class="monaco-editor-container"></div>
      </div>
      
      <div class="editor-footer">
        <div class="language-selector">
          <label>Language:</label>
          <select [(ngModel)]="selectedLanguage" (change)="changeLanguage()">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
        <div class="editor-actions">
          <button (click)="clearCode()">Clear</button>
          <button (click)="downloadCode()">Download</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .editor-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #1e1e1e;
      color: #fff;
    }

    .editor-header {
      background: #2d2d30;
      padding: 10px 15px;
      border-bottom: 1px solid #3c3c3c;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .session-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .session-id {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .session-id label {
      font-weight: bold;
      min-width: 80px;
    }

    .session-id input {
      padding: 5px 10px;
      border: 1px solid #555;
      border-radius: 4px;
      background: #383838;
      color: #fff;
      min-width: 200px;
    }

    .session-id button {
      padding: 5px 15px;
      border: none;
      border-radius: 4px;
      background: #0066cc;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .session-id button:hover:not(:disabled) {
      background: #0052a3;
    }

    .session-id button:disabled {
      background: #555;
      cursor: not-allowed;
    }

    .current-session {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
    }

    .session-code {
      font-family: 'Courier New', monospace;
      background: #4d4d4d;
      padding: 2px 8px;
      border-radius: 3px;
      font-weight: bold;
    }

    .participants {
      color: #0066cc;
      font-weight: bold;
    }

    .sync-status {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .status-indicator {
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
    }

    .status-indicator.online {
      background: #28a745;
      color: white;
    }

    .status-indicator.offline {
      background: #dc3545;
      color: white;
    }

    .last-sync {
      font-size: 12px;
      color: #ccc;
    }

    .editor-wrapper {
      flex: 1;
      position: relative;
    }

    .monaco-editor-container {
      width: 100%;
      height: 100%;
    }

    .editor-footer {
      background: #2d2d30;
      padding: 10px 15px;
      border-top: 1px solid #3c3c3c;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .language-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .language-selector select {
      padding: 5px 10px;
      border: 1px solid #555;
      border-radius: 4px;
      background: #383838;
      color: #fff;
    }

    .editor-actions {
      display: flex;
      gap: 10px;
    }

    .editor-actions button {
      padding: 5px 15px;
      border: none;
      border-radius: 4px;
      background: #555;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    }

    .editor-actions button:hover {
      background: #666;
    }

    @media (max-width: 768px) {
      .editor-header {
        flex-direction: column;
        align-items: stretch;
      }

      .session-info {
        align-items: stretch;
      }

      .session-id {
        flex-direction: column;
        align-items: stretch;
      }

      .session-id input {
        min-width: unset;
        width: 100%;
      }

      .editor-footer {
        flex-direction: column;
        gap: 10px;
        align-items: stretch;
      }
    }
  `]
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;

  private editor: any;
  private subscriptions = new Subscription();
  
  sessionIdInput = '';
  currentSessionId: string | null = null;
  currentSession: CodeSession | null = null;
  selectedLanguage = 'javascript';
  isOnline = false;
  lastSyncTime: Date | null = null;

  constructor(private syncService: SyncService) {}

  ngOnInit() {
    this.loadMonacoEditor();
    this.currentSessionId = this.syncService.getCurrentSessionId();
    
    // Subscribe to code changes
    this.subscriptions.add(
      this.syncService.code$.subscribe(code => {
        if (this.editor && this.editor.getValue() !== code) {
          this.editor.setValue(code);
        }
      })
    );

    // Subscribe to session changes
    this.subscriptions.add(
      this.syncService.session$.subscribe(session => {
        this.currentSession = session;
        if (session) {
          this.lastSyncTime = new Date();
          this.isOnline = true;
        }
      })
    );

    // If we have a current session, join it
    if (this.currentSessionId) {
      this.syncService.joinSession(this.currentSessionId);
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    if (this.editor) {
      this.editor.dispose();
    }
  }

  private async loadMonacoEditor() {
    // Load Monaco Editor
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs/loader.js';
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).require.config({ 
        paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs' } 
      });
      
      (window as any).require(['vs/editor/editor.main'], () => {
        this.initializeEditor();
      });
    };
  }

  private initializeEditor() {
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: '// Welcome to Code Sync!\n// Create or join a session to start sharing code.\n\nconsole.log("Hello World!");',
      language: this.selectedLanguage,
      theme: 'vs-dark',
      automaticLayout: true,
      fontSize: 14,
      wordWrap: 'on',
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all'
    });

    // Listen for content changes
    this.editor.onDidChangeModelContent((event: any) => {
      const code = this.editor.getValue();
      this.syncService.updateCode(code);
    });
  }

  createNewSession() {
    const sessionId = this.syncService.createSession();
    this.currentSessionId = sessionId;
    this.sessionIdInput = '';
    
    if (this.editor) {
      this.editor.setValue('// New session created!\n// Share this session ID with others: ' + sessionId + '\n\n');
    }
  }

  joinSession() {
    if (!this.sessionIdInput.trim()) return;
    
    this.syncService.joinSession(this.sessionIdInput.trim());
    this.currentSessionId = this.sessionIdInput.trim();
    this.sessionIdInput = '';
  }

  changeLanguage() {
    if (this.editor) {
      monaco.editor.setModelLanguage(this.editor.getModel(), this.selectedLanguage);
    }
  }

  clearCode() {
    if (this.editor && confirm('Are you sure you want to clear the code? This will affect all participants.')) {
      this.editor.setValue('');
    }
  }

  downloadCode() {
    if (this.editor) {
      const code = this.editor.getValue();
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `code-${this.currentSessionId || 'untitled'}.${this.getFileExtension()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  private getFileExtension(): string {
    const extensions: { [key: string]: string } = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'markdown': 'md'
    };
    return extensions[this.selectedLanguage] || 'txt';
  }
}