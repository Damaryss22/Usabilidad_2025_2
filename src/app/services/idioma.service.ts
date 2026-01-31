import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdiomaService {
  private _currentLang: BehaviorSubject<string>;
  currentLang$;

constructor() {
  let savedLang = 'es';
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('lang');
    if (stored) savedLang = stored;
    else localStorage.setItem('lang', savedLang);
  }
  this._currentLang = new BehaviorSubject<string>(savedLang);
  this.currentLang$ = this._currentLang.asObservable();

  console.log('[IdiomaService] Idioma inicial:', savedLang);
}

  // Cambiar idioma y guardarlo inmediatamente
  changeLang(lang: string) {
    console.log('[IdiomaService] Cambiando idioma a:', lang);
    this._currentLang.next(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
    }
  }

  // Getter del idioma actual
  get currentLang() {
    return this._currentLang.value;
  }
}
