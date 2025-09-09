import { Component, OnInit, ViewChild } from '@angular/core';
import { StorageService, CodeSnippet, Device } from './services/storage.service';
import { SyncService, SyncStatus } from './services/sync.service';
import { MonacoEditorComponent } from './components/monaco-editor.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild('editor') editor!: MonacoEditorComponent;

  title = 'Code Sync';
  snippets: CodeSnippet[] = [];
  devices: Device[] = [];
  syncStatus: SyncStatus = {
    isOnline: true,
    lastSync: Date.now(),
    activeDevices: 1,
    syncInProgress: false
  };

  currentSnippet: CodeSnippet | null = null;
  newSnippetTitle = '';
  selectedLanguage = 'javascript';
  autoSave = true;
  lastSaveTime = 0;

  languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'php', label: 'PHP' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' }
  ];

  constructor(
    private storageService: StorageService,
    private syncService: SyncService
  ) {}

  ngOnInit(): void {
    // Subscribe to data changes
    this.storageService.snippets$.subscribe(snippets => {
      this.snippets = snippets;
      // If current snippet was updated by another device, refresh editor
      if (this.currentSnippet) {
        const updated = snippets.find(s => s.id === this.currentSnippet!.id);
        if (updated && updated.timestamp > this.lastSaveTime) {
          this.currentSnippet = updated;
          if (this.editor) {
            this.editor.updateContent(updated.content);
            this.editor.updateLanguage(updated.language);
          }
        }
      }
    });

    this.storageService.devices$.subscribe(devices => {
      this.devices = devices;
    });

    this.syncService.syncStatus$.subscribe(status => {
      this.syncStatus = status;
    });

    // Create initial snippet if none exists
    if (this.snippets.length === 0) {
      this.createNewSnippet();
    } else {
      this.selectSnippet(this.snippets[0]);
    }
  }

  onContentChange(content: string): void {
    if (this.currentSnippet && this.autoSave) {
      this.currentSnippet.content = content;
      this.debouncedSave();
    }
  }

  private debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveCurrentSnippet();
    }, 1000);
  }

  private saveTimeout: any;

  saveCurrentSnippet(): void {
    if (this.currentSnippet) {
      this.lastSaveTime = Date.now();
      this.storageService.saveSnippet(this.currentSnippet);
    }
  }

  createNewSnippet(): void {
    const title = this.newSnippetTitle.trim() || `Snippet ${Date.now().toString().substr(-4)}`;
    const snippet = this.storageService.createSnippet(title, '', this.selectedLanguage);
    this.storageService.saveSnippet(snippet);
    this.selectSnippet(snippet);
    this.newSnippetTitle = '';
  }

  selectSnippet(snippet: CodeSnippet): void {
    // Save current snippet before switching
    if (this.currentSnippet && this.editor) {
      this.currentSnippet.content = this.editor.getContent();
      this.saveCurrentSnippet();
    }

    this.currentSnippet = snippet;
    this.selectedLanguage = snippet.language;
    
    if (this.editor) {
      this.editor.updateContent(snippet.content);
      this.editor.updateLanguage(snippet.language);
      setTimeout(() => this.editor.focus(), 100);
    }
  }

  deleteSnippet(snippet: CodeSnippet): void {
    if (confirm(`Delete snippet "${snippet.title}"?`)) {
      this.storageService.deleteSnippet(snippet.id);
      
      if (this.currentSnippet?.id === snippet.id) {
        const remaining = this.snippets.filter(s => s.id !== snippet.id);
        if (remaining.length > 0) {
          this.selectSnippet(remaining[0]);
        } else {
          this.createNewSnippet();
        }
      }
    }
  }

  updateSnippetLanguage(): void {
    if (this.currentSnippet) {
      this.currentSnippet.language = this.selectedLanguage;
      if (this.editor) {
        this.editor.updateLanguage(this.selectedLanguage);
      }
      this.saveCurrentSnippet();
    }
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }

  formatLastSeen(timestamp: number): string {
    return this.formatTimestamp(timestamp);
  }

  getSyncStatusText(): string {
    if (this.syncStatus.syncInProgress) return 'Syncing...';
    if (!this.syncStatus.isOnline) return 'Offline';
    return 'Online';
  }

  getSyncStatusClass(): string {
    if (this.syncStatus.syncInProgress) return 'syncing';
    if (!this.syncStatus.isOnline) return 'offline';
    return 'online';
  }

  forceSync(): void {
    this.syncService.forceSync();
  }

  clearAllData(): void {
    if (confirm('This will delete all snippets and cannot be undone. Continue?')) {
      this.storageService.clearAllData();
      this.currentSnippet = null;
      this.createNewSnippet();
    }
  }

  exportData(): void {
    const data = {
      snippets: this.snippets,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-sync-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importData(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.snippets && Array.isArray(data.snippets)) {
          if (confirm(`Import ${data.snippets.length} snippets? This will add to existing data.`)) {
            data.snippets.forEach((snippet: CodeSnippet) => {
              // Generate new ID to avoid conflicts
              snippet.id = this.storageService.createSnippet('', '', '').id;
              snippet.deviceId = this.storageService.getCurrentDeviceId();
              snippet.deviceName = this.storageService.getDeviceName();
              this.storageService.saveSnippet(snippet);
            });
          }
        }
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }
}