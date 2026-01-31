import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Encabezado } from '../encabezado/encabezado';
import { Footer } from '../footer/footer';

export interface Materia {
  id: number;
  nombre: string;
  color: string;
}

export interface Tarea {
  id: number;
  titulo: string;
  materiaId: number;
  materiaNombre?: string;
  materiaColor?: string;
  descripcion: string;
  fechaEntrega: string;
  horaEntrega: string;
  prioridad: 'baja' | 'media' | 'alta';
  completada: boolean;
  archivoAdjunto?: string;
  nombreArchivo?: string;
  tipoArchivo?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-buscar',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado, Footer],
  templateUrl: './buscar.html',
  styleUrls: ['./buscar.css']
})
export class BuscarComponent implements OnInit {
  searchTerm = '';
  selectedFilter = 'todas';
  
  todasLasTareas: Tarea[] = [];
  tareasMostradas: Tarea[] = [];
  materias: Materia[] = [];

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // 1. Cargar Materias (para obtener nombres y colores)
    const materiasGuardadas = localStorage.getItem('materias');
    if (materiasGuardadas) {
      this.materias = JSON.parse(materiasGuardadas);
    }

    // 2. Cargar Tareas del Usuario Logueado
    const sesionActiva = localStorage.getItem('usuarioActivo');
    const usuariosRegistrados = localStorage.getItem('usuarios');

    if (sesionActiva && usuariosRegistrados) {
      try {
        const usuarioSesion = JSON.parse(sesionActiva);
        const usuarios = JSON.parse(usuariosRegistrados);
        
        const usuarioActual = usuarios.find((u: any) => 
          u.correo === usuarioSesion.correo || u.email === usuarioSesion.email
        );

        if (usuarioActual && usuarioActual.tareas) {
          this.todasLasTareas = usuarioActual.tareas.map((t: any) => {
            // Enriquecer tareas con info de materia
            const materiaIdNum = Number(t.materiaId);
            const materia = this.materias.find(m => m.id === materiaIdNum);
            return {
              ...t,
              materiaNombre: materia?.nombre,
              materiaColor: materia?.color
            };
          });
        }
      } catch (e) {
        console.error('Error cargando datos en buscar:', e);
      }
    }
    
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let tareas = this.todasLasTareas;

    // Filtrar por estado
    if (this.selectedFilter !== 'todas') {
      if (this.selectedFilter === 'pendiente') {
        tareas = tareas.filter(t => !t.completada);
      } else if (this.selectedFilter === 'completada') {
        tareas = tareas.filter(t => t.completada);
      } else if (this.selectedFilter === 'atrasada') {
         // Lógica para atrasada
         const hoy = new Date();
         hoy.setHours(0,0,0,0);
         tareas = tareas.filter(t => {
           const entrega = new Date(t.fechaEntrega + 'T00:00:00');
           return !t.completada && entrega < hoy;
         });
      }
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      tareas = tareas.filter(t => 
        t.titulo.toLowerCase().includes(term) ||
        (t.materiaNombre && t.materiaNombre.toLowerCase().includes(term)) ||
        t.descripcion.toLowerCase().includes(term)
      );
    }

    this.tareasMostradas = tareas;
  }

  limpiarBusqueda(): void {
    this.searchTerm = '';
    this.selectedFilter = 'todas';
    this.aplicarFiltros();
  }

  getPrioridadClass(prioridad: string): string {
    return `prioridad-${prioridad}`;
  }

  getPrioridadLabel(prioridad: string): string {
    const labels = { baja: '🟢', media: '🟡', alta: '🔴' };
    return labels[prioridad as keyof typeof labels] || prioridad;
  }

  getEstadoClass(tarea: Tarea): string {
    if (tarea.completada) return 'estado-completada';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    // Asumimos fecha como YYYY-MM-DD
    const entrega = new Date(tarea.fechaEntrega + 'T00:00:00'); 
    
    // Comparacion simple
    if (entrega.getTime() < hoy.getTime()) return 'estado-atrasada';
    return 'estado-pendiente';
  }

  getEstadoLabel(tarea: Tarea): string {
    if (tarea.completada) return 'COMPLETADA';
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const entrega = new Date(tarea.fechaEntrega + 'T00:00:00');
    if (entrega.getTime() < hoy.getTime()) return 'ATRASADA';
    return 'PENDIENTE';
  }
}