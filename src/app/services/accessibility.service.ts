import { Injectable, Renderer2, RendererFactory2, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private renderer: Renderer2;
  private body: HTMLElement | null = null;
  private recognition: any = null;
  private recognitionActive = false;

  // --- Propiedades de estado ---
  isMenuOpen = false;
  isHighContrast = false;
  fontSize = 100;
  fontType = 'sans-serif';
  customColor = '#007bff';
  letterSpacing = 0;
  lineHeight = 1.6;
  isSpeechActive = false;
  isKeyboardNavActive = true;
  isLargeButtonsActive = false;
  isVoiceControlActive = false;
  isAutoScrollBlocked = false;

  // Escala de botones (1.0 = 100% original). Usamos 1.015 para +1.5%
  buttonScale = 1.0;

  customShortcuts: { [key: string]: string } = {
    'Alt+c': 'toggleHighContrast',
    'Alt++': 'increaseFontSize',
    'Alt+-': 'decreaseFontSize',
    'Alt+r': 'resetSettings'
  };

  private readonly STORAGE_KEY = 'accessibility-settings';
  private isBrowser: boolean;

  constructor(
    rendererFactory: RendererFactory2,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.body = document.body;
      this.loadSettings();
      this.applySettings();
    }
  }

  ngOnDestroy(): void {
    this.stopSpeaking();
    if (this.isBrowser) this.stopVoiceRecognition();
  }

  // --- TOGGLE PRINCIPAL DEL MENÚ ---
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // --- FUNCIONALIDADES DE ACCESIBILIDAD ---

  // 1. Alto Contraste / Modo Oscuro
  toggleHighContrast(): void {
    if (!this.isBrowser || !this.body) return;

    this.isHighContrast = !this.isHighContrast;

    if (this.isHighContrast) {
      this.renderer.addClass(this.body, 'dark-mode');
    } else {
      this.renderer.removeClass(this.body, 'dark-mode');
    }

    this.saveSettings();
  }

  // 2. Tamaño de Texto (Aumentar/Disminuir)
  changeFontSize(delta: number): void {
    if (!this.isBrowser || !this.body) return;

    // Ajusta tamaño dentro de rango seguro (80% - 200%)
    this.fontSize = Math.min(200, Math.max(80, this.fontSize + delta));

    // Aplica el tamaño global
    this.renderer.setStyle(this.body, 'font-size', `${this.fontSize}%`);

    // Guarda el valor actualizado en localStorage
    this.saveSettings();
  }

  // 3. Tipo de Fuente
  setFontType(type: string): void {
    if (!this.isBrowser || !this.body) return;
    this.fontType = type;
    this.renderer.setStyle(this.body, 'font-family', this.fontType);
    this.saveSettings();
  }

  // 4. Color Personalizado
  setCustomColor(color: string): void {
    if (!this.isBrowser || !this.body) return;
    this.customColor = color;
    this.renderer.setStyle(this.body, '--custom-accent-color', this.customColor);
    this.saveSettings();
  }

  // 5. Ajuste de Espaciado
  changeSpacing(type: 'letter' | 'line', delta: number): void {
    if (!this.isBrowser || !this.body) return;
    if (type === 'letter') {
      this.letterSpacing = Math.min(5, Math.max(0, this.letterSpacing + delta));
      this.renderer.setStyle(this.body, 'letter-spacing', `${this.letterSpacing}px`);
    } else if (type === 'line') {
      this.lineHeight = Math.min(2.5, Math.max(1.2, Number.parseFloat((this.lineHeight + delta).toFixed(1))));
      this.renderer.setStyle(this.body, 'line-height', this.lineHeight.toString());
    }
    this.saveSettings();
  }

  // 6. Lectura por Voz
  toggleSpeech(text = ''): void {
    this.isSpeechActive = !this.isSpeechActive;
    if (this.isSpeechActive && text) {
      this.speak(text);
    } else {
      this.stopSpeaking();
    }
  }

  private speak(text: string): void {
    this.stopSpeaking();
    if (this.isBrowser && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.lang = 'es-ES';
      utterance.onend = () => {
        this.isSpeechActive = false;
      };
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Tu navegador no soporta la lectura por voz.');
      this.isSpeechActive = false;
    }
  }

  private stopSpeaking(): void {
    if (this.isBrowser && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    this.isSpeechActive = false;
  }

  readSelection(event?: MouseEvent | FocusEvent): void {
    if (!this.isSpeechActive || !this.isBrowser) return;

    let textToRead = '';
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      textToRead = selection.toString();
    } else if (event && event.target instanceof HTMLElement) {
      textToRead = event.target.textContent?.trim() || '';
    }

    if (textToRead) this.speak(textToRead);
  }

  // 7. Navegación por Teclado
  toggleKeyboardNav(active?: boolean): void {
    if (!this.isBrowser || !this.body) return;
    if (active !== undefined) {
      this.isKeyboardNavActive = active;
    } else {
      this.isKeyboardNavActive = !this.isKeyboardNavActive;
    }

    if (!this.isKeyboardNavActive) {
      this.renderer.addClass(this.body, 'disable-keyboard-nav');
    } else {
      this.renderer.removeClass(this.body, 'disable-keyboard-nav');
    }
    this.saveSettings();
  }

  // 8. Botones Grandes
  toggleLargeButtons(): void {
    if (!this.isBrowser || !this.body) return;
    this.isLargeButtonsActive = !this.isLargeButtonsActive;

    if (this.isLargeButtonsActive) {
      // +1.5% -> 1.015 scale. Cambia este valor si quieres otro porcentaje.
      this.buttonScale = 0.05;
      this.renderer.addClass(this.body, 'large-buttons');
    } else {
      this.buttonScale = 1.0;
      this.renderer.removeClass(this.body, 'large-buttons');
    }

    // Siempre aplicamos la variable CSS para que tu CSS use la escala.
    this.renderer.setStyle(this.body, '--accessibility-button-scale', this.buttonScale.toString());

    this.saveSettings();
  }

  // 9. Control por Voz
  toggleVoiceControl(): void {
    if (!this.isBrowser) return;
    this.isVoiceControlActive = !this.isVoiceControlActive;
    if (this.isVoiceControlActive) {
      this.startVoiceRecognition();
    } else {
      this.stopVoiceRecognition();
    }
    this.saveSettings();
  }

  private startVoiceRecognition(): void {
    if (!this.isBrowser) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Tu navegador no soporta reconocimiento de voz.');
      this.isVoiceControlActive = false;
      return;
    }

    if (this.recognitionActive) return;

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-ES';

    this.recognition.onstart = () => {
      this.recognitionActive = true;
      console.log('Reconocimiento de voz activado');
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      this.processVoiceCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      if (['no-speech', 'audio-capture'].includes(event.error)) {
        setTimeout(() => {
          if (this.isVoiceControlActive) this.recognition?.start();
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      this.recognitionActive = false;
      if (this.isVoiceControlActive) {
        setTimeout(() => {
          if (this.isVoiceControlActive && !this.recognitionActive) {
            this.recognition?.start();
          }
        }, 500);
      }
    };

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error al iniciar reconocimiento de voz:', error);
      this.isVoiceControlActive = false;
    }
  }

  private processVoiceCommand(command: string): void {
    const normalized = command.toLowerCase().trim();
    if (normalized.includes('contraste') || normalized.includes('oscuro')) this.toggleHighContrast();
    else if (normalized.includes('aumentar texto') || normalized.includes('agrandar')) this.changeFontSize(10);
    else if (normalized.includes('disminuir texto') || normalized.includes('reducir')) this.changeFontSize(-10);
    else if (normalized.includes('botones grandes')) this.toggleLargeButtons();
    else if (normalized.includes('reiniciar') || normalized.includes('restablecer')) this.resetSettings();
    else if (normalized.includes('leer')) this.isSpeechActive = true;
    else if (normalized.includes('detener lectura') || normalized.includes('parar')) this.stopSpeaking();
  }

  private stopVoiceRecognition(): void {
    if (this.recognition) {
      this.recognitionActive = false;
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error al detener reconocimiento de voz:', error);
      }
      this.recognition = null;
    }
  }

  // 10. Bloqueo de Auto-scroll
  toggleAutoScrollBlock(): void {
    if (!this.isBrowser || !this.body) return;
    this.isAutoScrollBlocked = !this.isAutoScrollBlocked;

    if (this.isAutoScrollBlocked) {
      this.renderer.addClass(this.body, 'block-autoscroll');
      this.blockAutoplayVideos();
    } else {
      this.renderer.removeClass(this.body, 'block-autoscroll');
    }
    this.saveSettings();
  }

  private blockAutoplayVideos(): void {
    if (!this.isBrowser) return;
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach((video: any) => {
      video.pause();
      video.removeAttribute('autoplay');
    });
  }

  // 11. Atajos personalizados
  executeShortcut(shortcut: string): void {
    const normalized = shortcut.replace(/\s+/g, '').toLowerCase();
    const command = this.customShortcuts[normalized];
    if (!command) return;

    switch (command) {
      case 'toggleHighContrast': this.toggleHighContrast(); break;
      case 'increaseFontSize': this.changeFontSize(10); break;
      case 'decreaseFontSize': this.changeFontSize(-10); break;
      case 'resetSettings': this.resetSettings(); break;
      default: console.log(`Comando no reconocido: ${command}`);
    }
  }

  addCustomShortcut(keys: string, command: string): void {
    const normalizedKeys = keys.replace(/\s+/g, '').toLowerCase();
    this.customShortcuts[normalizedKeys] = command;
    this.saveSettings();
  }

  removeCustomShortcut(keys: string): void {
    const normalizedKeys = keys.replace(/\s+/g, '').toLowerCase();
    delete this.customShortcuts[normalizedKeys];
    this.saveSettings();
  }

  resetSettings(): void {
    this.fontSize = 100;
    this.fontType = 'sans-serif';
    this.letterSpacing = 0;
    this.lineHeight = 1.6;
    this.customColor = '#007bff';
    this.isHighContrast = false;
    this.isLargeButtonsActive = false;
    this.isAutoScrollBlocked = false;
    this.buttonScale = 1.0;
    if (this.isBrowser) {
      this.applySettings();
    }
    this.saveSettings();
  }

  private saveSettings(): void {
    if (!this.isBrowser) return;
    const settings = {
      fontSize: this.fontSize,
      fontType: this.fontType,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      customColor: this.customColor,
      isHighContrast: this.isHighContrast,
      isKeyboardNavActive: this.isKeyboardNavActive,
      isLargeButtonsActive: this.isLargeButtonsActive,
      isAutoScrollBlocked: this.isAutoScrollBlocked,
      buttonScale: this.buttonScale,
      customShortcuts: this.customShortcuts
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  private loadSettings(): void {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;
    const s = JSON.parse(saved);
    this.fontSize = s.fontSize ?? 100;
    this.fontType = s.fontType ?? 'sans-serif';
    this.letterSpacing = s.letterSpacing ?? 0;
    this.lineHeight = s.lineHeight ?? 1.6;
    this.customColor = s.customColor ?? '#007bff';
    this.isHighContrast = s.isHighContrast ?? false;
    this.isKeyboardNavActive = s.isKeyboardNavActive ?? true;
    this.isLargeButtonsActive = s.isLargeButtonsActive ?? false;
    this.isAutoScrollBlocked = s.isAutoScrollBlocked ?? false;
    this.buttonScale = s.buttonScale ?? 1.0;
    this.customShortcuts = s.customShortcuts ?? this.customShortcuts;
  }

  private applySettings(): void {
    if (!this.isBrowser || !this.body) return;
    this.renderer.setStyle(this.body, 'font-family', this.fontType);
    this.renderer.setStyle(this.body, 'letter-spacing', `${this.letterSpacing}px`);
    this.renderer.setStyle(this.body, 'line-height', this.lineHeight.toString());
    this.renderer.setStyle(this.body, '--custom-accent-color', this.customColor);

    // Aplicar clase/estilos relacionados con las opciones
    if (this.isHighContrast) this.renderer.addClass(this.body, 'high-contrast');
    else this.renderer.removeClass(this.body, 'high-contrast');

    if (!this.isKeyboardNavActive) this.renderer.addClass(this.body, 'disable-keyboard-nav');
    else this.renderer.removeClass(this.body, 'disable-keyboard-nav');

    if (this.isLargeButtonsActive) this.renderer.addClass(this.body, 'large-buttons');
    else this.renderer.removeClass(this.body, 'large-buttons');

    if (this.isAutoScrollBlocked) this.renderer.addClass(this.body, 'block-autoscroll');
    else this.renderer.removeClass(this.body, 'block-autoscroll');

    // Aplicar la escala de botones mediante una variable CSS que tu CSS puede consumir
    this.renderer.setStyle(this.body, '--accessibility-button-scale', this.buttonScale.toString());

    this.renderer.setStyle(this.body, 'font-size', `${this.fontSize}%`);
  }

  getSettings() {
    return {
      isMenuOpen: this.isMenuOpen,
      fontSize: this.fontSize,
      fontType: this.fontType,
      letterSpacing: this.letterSpacing,
      lineHeight: this.lineHeight,
      customColor: this.customColor,
      isHighContrast: this.isHighContrast,
      isKeyboardNavActive: this.isKeyboardNavActive,
      isLargeButtonsActive: this.isLargeButtonsActive,
      isAutoScrollBlocked: this.isAutoScrollBlocked,
      isSpeechActive: this.isSpeechActive,
      isVoiceControlActive: this.isVoiceControlActive,
      customShortcuts: this.customShortcuts,
      buttonScale: this.buttonScale
    };
  }
}
