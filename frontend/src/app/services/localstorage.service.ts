import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Code sync specific methods
  saveCode(sessionId: string, code: string): void {
    this.setItem(`code_${sessionId}`, {
      code,
      lastModified: Date.now(),
      sessionId
    });
  }

  getCode(sessionId: string): { code: string; lastModified: number; sessionId: string } | null {
    return this.getItem(`code_${sessionId}`);
  }

  saveSessionId(sessionId: string): void {
    this.setItem('currentSessionId', sessionId);
  }

  getCurrentSessionId(): string | null {
    return this.getItem('currentSessionId');
  }
}