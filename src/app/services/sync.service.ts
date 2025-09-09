import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: number;
  activeDevices: number;
  syncInProgress: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncStatusSubject = new BehaviorSubject<SyncStatus>({
    isOnline: true,
    lastSync: Date.now(),
    activeDevices: 1,
    syncInProgress: false
  });

  public syncStatus$ = this.syncStatusSubject.asObservable();

  constructor() {
    this.initializeSync();
  }

  private initializeSync(): void {
    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key?.startsWith('code_sync_')) {
        this.updateSyncStatus();
      }
    });

    // Monitor online/offline status
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));

    // Initial status update
    this.updateSyncStatus();
  }

  private updateSyncStatus(): void {
    const currentStatus = this.syncStatusSubject.value;
    const devicesData = localStorage.getItem('code_sync_devices');
    const activeDevices = devicesData ? JSON.parse(devicesData).length : 1;

    this.syncStatusSubject.next({
      ...currentStatus,
      lastSync: Date.now(),
      activeDevices,
      syncInProgress: false
    });
  }

  private updateOnlineStatus(isOnline: boolean): void {
    const currentStatus = this.syncStatusSubject.value;
    this.syncStatusSubject.next({
      ...currentStatus,
      isOnline
    });
  }

  setSyncInProgress(inProgress: boolean): void {
    const currentStatus = this.syncStatusSubject.value;
    this.syncStatusSubject.next({
      ...currentStatus,
      syncInProgress: inProgress
    });
  }

  getSyncStatus(): SyncStatus {
    return this.syncStatusSubject.value;
  }

  forceSync(): void {
    this.setSyncInProgress(true);
    
    // Simulate sync process
    setTimeout(() => {
      this.updateSyncStatus();
    }, 1000);
  }
}