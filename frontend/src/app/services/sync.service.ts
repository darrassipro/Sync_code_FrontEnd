import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { LocalStorageService } from './localstorage.service';

export interface CodeSession {
  code: string;
  lastModified: number;
  participants: number;
  lastUpdatedBy?: string;
}

export interface SyncResponse {
  success: boolean;
  data?: CodeSession;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private apiUrl = '/api/sync'; // This will work with Vercel routing
  private currentCode = new BehaviorSubject<string>('');
  private currentSession = new BehaviorSubject<CodeSession | null>(null);
  private participantId = this.generateId();
  private syncInterval = 2000; // 2 seconds

  public code$ = this.currentCode.asObservable();
  public session$ = this.currentSession.asObservable();

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService
  ) {
    // Start polling for updates
    interval(this.syncInterval).subscribe(() => {
      const currentSessionId = this.localStorage.getCurrentSessionId();
      if (currentSessionId) {
        this.fetchSession(currentSessionId);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  createSession(): string {
    const sessionId = this.generateId();
    this.localStorage.saveSessionId(sessionId);
    this.joinSession(sessionId);
    return sessionId;
  }

  joinSession(sessionId: string): void {
    this.localStorage.saveSessionId(sessionId);
    
    // Join session (increment participant count)
    this.http.put<SyncResponse>(`${this.apiUrl}?sessionId=${sessionId}`, {}).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentSession.next(response.data);
          this.currentCode.next(response.data.code);
          
          // Save to localStorage
          this.localStorage.saveCode(sessionId, response.data.code);
        }
      },
      error: (error) => {
        console.error('Error joining session:', error);
        // Fallback to localStorage
        const localData = this.localStorage.getCode(sessionId);
        if (localData) {
          this.currentCode.next(localData.code);
        }
      }
    });
  }

  updateCode(code: string): void {
    const sessionId = this.localStorage.getCurrentSessionId();
    if (!sessionId) return;

    this.currentCode.next(code);
    this.localStorage.saveCode(sessionId, code);

    // Send to server
    this.http.post<SyncResponse>(`${this.apiUrl}?sessionId=${sessionId}`, {
      code,
      participantId: this.participantId
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentSession.next(response.data);
        }
      },
      error: (error) => {
        console.error('Error updating code:', error);
      }
    });
  }

  fetchSession(sessionId: string): void {
    this.http.get<SyncResponse>(`${this.apiUrl}?sessionId=${sessionId}`).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Only update if the server version is newer
          const localData = this.localStorage.getCode(sessionId);
          if (!localData || response.data.lastModified > localData.lastModified) {
            this.currentCode.next(response.data.code);
            this.localStorage.saveCode(sessionId, response.data.code);
          }
          this.currentSession.next(response.data);
        }
      },
      error: (error) => {
        console.error('Error fetching session:', error);
        // Use local storage as fallback
        const localData = this.localStorage.getCode(sessionId);
        if (localData) {
          this.currentCode.next(localData.code);
        }
      }
    });
  }

  getCurrentSessionId(): string | null {
    return this.localStorage.getCurrentSessionId();
  }

  getParticipantId(): string {
    return this.participantId;
  }
}