import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ✅ Importar Router
import { PreferenciasService } from '../services/preferencias.service';
import { IdiomaService } from '../services/idioma.service';
import { MenuComponent } from '../menu/menu';
import { AccessibilityMenu } from '../accessibility-menu/accessibility-menu';

@Component({
  selector: 'app-encabezado',
  standalone: true,
  imports: [CommonModule, FormsModule, MenuComponent, AccessibilityMenu],
  templateUrl: './encabezado.html',
  styleUrls: ['./encabezado.css']
})
export class Encabezado implements OnInit {
  currentLang: string | null = null;
  menuOpen = false;
  userType: 'admin' | 'estudiante' = 'estudiante'; // 👈 Tipo de usuario actual

  textos: any = {
    es: {
      menu: 'Menú',
      perfil: 'Perfil',
      cerrarSesion: 'Cerrar sesión',
      organizador: 'Organizador de Tareas'
    },
    en: {
      menu: 'Menu',
      perfil: 'Profile',
      cerrarSesion: 'Logout',
      organizador: 'Task Organizer'
    }
  };

  constructor(
    private preferencias: PreferenciasService,
    private idioma: IdiomaService,
    private cdr: ChangeDetectorRef,
    private router: Router // ✅ Inyectar Router
  ) {}

  ngOnInit() {
    // ⚠️ Verificar si estamos en entorno de navegador
    const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

    // ✅ Cargar idioma desde el servicio
    this.currentLang = this.idioma.currentLang;
    this.idioma.currentLang$.subscribe(lang => {
      this.currentLang = lang;
      this.cdr.detectChanges();
    });

    // ✅ Determinar tipo de usuario solo si estamos en navegador
    if (isBrowser) {
      const tipo = localStorage.getItem('tipoUsuario');
      if (tipo === 'admin') {
        this.userType = 'admin';
      } else {
        this.userType = 'estudiante';
      }
    } else {
      console.warn('[Encabezado] Ejecutando fuera del navegador, usando valor por defecto.');
      this.userType = 'estudiante';
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openProfile() {
    this.router.navigate(['/perfil']); // ✅ Navegación SPA
  }

  changeLanguage(lang: string) {
    this.idioma.changeLang(lang);
    this.currentLang = lang;
  }

  logout() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('usuarioActivo');
      localStorage.removeItem('tipoUsuario');
      
      // ✅ Navegación SPA más suave y correcta
      this.router.navigate(['/login']);
    }
  }

  t(key: string) {
    if (!this.currentLang) return '';
    return this.textos[this.currentLang][key];
  }
}
