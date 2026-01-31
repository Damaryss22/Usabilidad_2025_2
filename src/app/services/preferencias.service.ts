import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PreferenciasService {
  private _darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this._darkMode.asObservable();

  constructor() {
    if (typeof window !== 'undefined') {
      const storedDark = localStorage.getItem('darkMode');
      const isDark = storedDark === 'true';
      this._darkMode.next(isDark);
      document.body.classList.toggle('dark-mode', isDark);
    }
  }

  toggleDarkMode() {
    const nuevo = !this._darkMode.value;
    this._darkMode.next(nuevo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', nuevo.toString());
    }
    document.body.classList.toggle('dark-mode', nuevo);
  }
}
