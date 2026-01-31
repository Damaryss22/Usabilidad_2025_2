import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ItemMenuComponent, MenuItem } from '../item-menu/item-menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, ItemMenuComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.css']
})
export class MenuComponent implements OnInit {
  @Input() userType: 'admin' | 'estudiante' = 'estudiante'; // 👈 Por defecto estudiante
  @Input() isOpen: boolean = false;

  menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.menuItems = this.getMenuItems(this.userType);
  }

  getMenuItems(tipo: 'admin' | 'estudiante'): MenuItem[] {
    if (tipo === 'admin') {
      return [
        { icon: '🏠', label: 'Inicio', route: '/admin', active: true },
        { icon: '👨‍🎓', label: 'Estudiantes', route: '/alumnos', active: false },
        { icon: '📚', label: 'Cursos', route: '/cursos', active: false },
        { icon: '🧾', label: 'Reportes', route: '/reportes', active: false },
        { icon: '⚙️', label: 'Configuración', route: '/configuracion', active: false }
      ];
    } else {
      return [
        { icon: '🏠', label: 'Inicio', route: '/alumnos', active: true },
        { icon: '🔍', label: 'buscar', route: '/buscar', active: false },
        { icon: '📖', label: 'Materias', route: '/materias', active: false },
        {icon: '📃', label: 'Tareas', route: '/tareas', active: false },
        { icon: '📅', label: 'Calendario', route: '/calendario', active: false },
        { icon: '❓', label: 'Ayudita', route: '/ayudita', active: false },
        { icon: '📋', label: 'Términos de Uso', route: '/terminos', active: false },
        { icon: '🔒', label: 'Privacidad', route: '/privacidad', active: false }
      ];
    }
  }

  onMenuItemClick(item: MenuItem): void {
    this.menuItems.forEach(i => i.active = false);
    item.active = true;
    console.log('Navegando a:', item.route);
    this.router.navigate([item.route]);
  }
}

  
