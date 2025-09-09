import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CodeSnippet {
  id: string;
  title: string;
  content: string;
  language: string;
  timestamp: number;
  deviceId: string;
  deviceName: string;
}

export interface Device {
  id: string;
  name: string;
  lastSeen: number;
  isCurrentDevice: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly SNIPPETS_KEY = 'code_sync_snippets';
  private readonly DEVICES_KEY = 'code_sync_devices';
  private readonly CURRENT_DEVICE_KEY = 'code_sync_current_device';
  
  private snippetsSubject = new BehaviorSubject<CodeSnippet[]>([]);
  private devicesSubject = new BehaviorSubject<Device[]>([]);
  private currentDeviceId: string = '';

  public snippets$ = this.snippetsSubject.asObservable();
  public devices$ = this.devicesSubject.asObservable();

  constructor() {
    this.initializeDevice();
    this.loadData();
    this.setupStorageListener();
    this.setupHeartbeat();
  }

  private initializeDevice(): void {
    let deviceId = localStorage.getItem(this.CURRENT_DEVICE_KEY);
    if (!deviceId) {
      deviceId = this.generateId();
      localStorage.setItem(this.CURRENT_DEVICE_KEY, deviceId);
    }
    this.currentDeviceId = deviceId;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadData(): void {
    // Load snippets
    const snippetsData = localStorage.getItem(this.SNIPPETS_KEY);
    if (snippetsData) {
      try {
        const snippets = JSON.parse(snippetsData);
        this.snippetsSubject.next(snippets);
      } catch (error) {
        console.error('Error loading snippets:', error);
        this.snippetsSubject.next([]);
      }
    }

    // Load and update devices
    this.updateDeviceList();
  }

  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.SNIPPETS_KEY) {
        const snippets = event.newValue ? JSON.parse(event.newValue) : [];
        this.snippetsSubject.next(snippets);
      } else if (event.key === this.DEVICES_KEY) {
        this.updateDeviceList();
      }
    });
  }

  private setupHeartbeat(): void {
    // Update device heartbeat every 5 seconds
    setInterval(() => {
      this.updateDeviceHeartbeat();
    }, 5000);

    // Initial heartbeat
    this.updateDeviceHeartbeat();
  }

  private updateDeviceHeartbeat(): void {
    const devices = this.getDevicesFromStorage();
    const currentTime = Date.now();
    
    // Update current device
    const existingDeviceIndex = devices.findIndex(d => d.id === this.currentDeviceId);
    const deviceName = `Device ${this.currentDeviceId.substr(-4)}`;
    
    if (existingDeviceIndex >= 0) {
      devices[existingDeviceIndex].lastSeen = currentTime;
      devices[existingDeviceIndex].name = deviceName;
    } else {
      devices.push({
        id: this.currentDeviceId,
        name: deviceName,
        lastSeen: currentTime,
        isCurrentDevice: true
      });
    }

    // Remove devices not seen for more than 30 seconds
    const activeDevices = devices.filter(d => currentTime - d.lastSeen < 30000);
    
    localStorage.setItem(this.DEVICES_KEY, JSON.stringify(activeDevices));
    this.updateDeviceList();
  }

  private updateDeviceList(): void {
    const devices = this.getDevicesFromStorage();
    devices.forEach(device => {
      device.isCurrentDevice = device.id === this.currentDeviceId;
    });
    this.devicesSubject.next(devices);
  }

  private getDevicesFromStorage(): Device[] {
    const devicesData = localStorage.getItem(this.DEVICES_KEY);
    return devicesData ? JSON.parse(devicesData) : [];
  }

  getCurrentDeviceId(): string {
    return this.currentDeviceId;
  }

  getDeviceName(): string {
    return `Device ${this.currentDeviceId.substr(-4)}`;
  }

  saveSnippet(snippet: CodeSnippet): void {
    const snippets = this.snippetsSubject.value;
    const existingIndex = snippets.findIndex(s => s.id === snippet.id);
    
    snippet.timestamp = Date.now();
    snippet.deviceId = this.currentDeviceId;
    snippet.deviceName = this.getDeviceName();

    if (existingIndex >= 0) {
      snippets[existingIndex] = snippet;
    } else {
      snippets.unshift(snippet);
    }

    // Keep only last 50 snippets
    if (snippets.length > 50) {
      snippets.splice(50);
    }

    localStorage.setItem(this.SNIPPETS_KEY, JSON.stringify(snippets));
    this.snippetsSubject.next([...snippets]);
  }

  deleteSnippet(id: string): void {
    const snippets = this.snippetsSubject.value.filter(s => s.id !== id);
    localStorage.setItem(this.SNIPPETS_KEY, JSON.stringify(snippets));
    this.snippetsSubject.next(snippets);
  }

  createSnippet(title: string, content: string, language: string = 'javascript'): CodeSnippet {
    return {
      id: this.generateId(),
      title,
      content,
      language,
      timestamp: Date.now(),
      deviceId: this.currentDeviceId,
      deviceName: this.getDeviceName()
    };
  }

  getSnippets(): CodeSnippet[] {
    return this.snippetsSubject.value;
  }

  getSnippetById(id: string): CodeSnippet | undefined {
    return this.snippetsSubject.value.find(s => s.id === id);
  }

  clearAllData(): void {
    localStorage.removeItem(this.SNIPPETS_KEY);
    this.snippetsSubject.next([]);
  }
}