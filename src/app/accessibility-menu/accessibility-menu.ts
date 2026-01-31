import { Component } from '@angular/core';
import { AccessibilityService } from '../services/accessibility.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility-menu',
  imports: [FormsModule, CommonModule],
  templateUrl: './accessibility-menu.html',
  styleUrl: './accessibility-menu.css',
})
export class AccessibilityMenu {
  // Opciones de fuente
  fontOptions = [
    { name: 'Sans-Serif (Predeterminado)', value: 'sans-serif' },
    { name: 'Serif (Con remates)', value: 'serif' },
    { name: 'Disléxicos (OpenDyslexic)', value: 'OpenDyslexic, sans-serif' },
  ];

  // Colores predefinidos
  colorOptions = ['#007bff', '#dc3545', '#ffc107', '#17a2b8', '#ffffff'];

  // Texto para lectura por voz
  defaultSpeechText =
    'Bienvenido al menú de accesibilidad. Selecciona un texto o un elemento para que el narrador lo lea.';

  constructor(public accessService: AccessibilityService) {}

  // --- Métodos conectados al HTML ---
  toggleMenu() { this.accessService.toggleMenu(); }
  toggleHighContrast() { this.accessService.toggleHighContrast(); }
  increaseFontSize() { this.accessService.changeFontSize(10); }
  decreaseFontSize() { this.accessService.changeFontSize(-10); }
  onFontTypeChange(font: string) { this.accessService.setFontType(font); }
  onColorChange(color: string) { this.accessService.setCustomColor(color); }
  toggleSpeech() { this.accessService.toggleSpeech(this.defaultSpeechText); }
  toggleLargeButtons() { this.accessService.toggleLargeButtons(); }
  toggleVoiceControl() { this.accessService.toggleVoiceControl(); }
  toggleKeyboardNav() { this.accessService.toggleKeyboardNav(); }
  toggleAutoScrollBlock() { this.accessService.toggleAutoScrollBlock(); }

  // Getter de estado general
  get settings() {
    return this.accessService.getSettings();
  }
}
