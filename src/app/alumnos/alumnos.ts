// alumnos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatCardComponent } from '../estadisticas/estadisticas';
import { TaskCardComponent } from '../tareas/tareas';
import { Ayuda } from '../ayuda/ayuda';
import { Encabezado } from '../encabezado/encabezado';
import { MenuComponent } from '../menu/menu';
import { Router, NavigationEnd } from '@angular/router';
import { Footer } from '../footer/footer';

interface Task {
  id: number;
  nombre: string;
  materia: string;
  fechaEntrega: string;
  calificacion: number;
  estado: 'completada' | 'pendiente' | 'atrasada';
  prioridad: 'alta' | 'media' | 'baja';
  necesitaAyuda: boolean;
}

interface HelpRequest {
  task: Task;
  tipoAyuda: string;
  mensaje: string;
}

@Component({
  selector: 'app-alumnos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StatCardComponent,
    TaskCardComponent,
    Ayuda,
    Encabezado,
    MenuComponent,
    Footer
  ],
  templateUrl: './alumnos.html',
  styleUrls: ['./alumnos.css']
})
export class AlumnosComponent implements OnInit {
  selectedTask: Task | null = null;
  showHelpModal = false;
  menuOpen = false;
  
  
  stats = {
    promedio: 0,
    tareasCompletadas: 0,
    tareasPendientes: 0,
    tareasAtrasadas: 0
  };

  tasks: Task[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario(): void {
    const sesionActiva = localStorage.getItem('usuarioActivo');
    const usuariosRegistrados = localStorage.getItem('usuarios');

    if (sesionActiva && usuariosRegistrados) {
      try {
        const usuarioSesion = JSON.parse(sesionActiva);
        const usuarios = JSON.parse(usuariosRegistrados);
        
        const usuarioActual = usuarios.find((u: any) => 
          u.correo === usuarioSesion.correo || u.email === usuarioSesion.email
        ); // Buscar por email/correo

        if (usuarioActual && usuarioActual.tareas) {
          const tareasUsuario = usuarioActual.tareas;
          this.mapTasks(tareasUsuario);
          this.calculateStats();
        } else {
          this.tasks = []; // Sin tareas
          this.resetStats();
        }
      } catch (error) {
        console.error('Error cargando datos de alumno:', error);
        this.tasks = [];
        this.resetStats();
      }
    } else {
      this.tasks = [];
      this.resetStats();
    }
  }

  mapTasks(tareas: any[]): void {
    const hoy = new Date();
    // Resetear hora para comparar solo fechas si se desea, o usar timestamp completo.
    
    this.tasks = tareas.map(t => {
      const fechaEntrega = new Date(t.fechaEntrega + 'T' + (t.horaEntrega || '23:59:00'));
      
      let estado: 'completada' | 'pendiente' | 'atrasada' = 'pendiente';
      if (t.completada) {
        estado = 'completada';
      } else if (fechaEntrega < hoy) {
        estado = 'atrasada';
      }

      // Lógica de "Necesita Ayuda": Si es prioridad Alta y no está completada
      const necesitaAyuda = (t.prioridad === 'alta' && !t.completada) || estado === 'atrasada';

      return {
        id: t.id,
        nombre: t.titulo, // Mapeo titulo -> nombre
        materia: t.materiaNombre || 'General',
        fechaEntrega: t.fechaEntrega,
        calificacion: 0, // No hay calificaciones en el módulo básico
        estado: estado,
        prioridad: t.prioridad,
        necesitaAyuda: necesitaAyuda
      };
    });

    this.sortTasksByPriority();
  }

  calculateStats(): void {
    const total = this.tasks.length;
    if (total === 0) {
      this.resetStats();
      return;
    }

    const completadas = this.tasks.filter(t => t.estado === 'completada').length;
    const atrasadas = this.tasks.filter(t => t.estado === 'atrasada').length;
    const pendientes = this.tasks.filter(t => t.estado === 'pendiente').length;

    // "Promedio" calculado como Eficiencia de Cumplimiento (0-100%)
    const promedio = Math.round((completadas / total) * 100);

    this.stats = {
      promedio: promedio,
      tareasCompletadas: completadas,
      tareasPendientes: pendientes,
      tareasAtrasadas: atrasadas
    };
  }

  resetStats(): void {
    this.stats = {
      promedio: 0,
      tareasCompletadas: 0,
      tareasPendientes: 0,
      tareasAtrasadas: 0
    };
  }

  sortTasksByPriority(): void {
    this.tasks.sort((a, b) => {
      const priorityOrder = { 'alta': 1, 'media': 2, 'baja': 3 };
      return priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
    });
  }

  openHelpModal(task: Task): void {
    this.selectedTask = task;
    this.showHelpModal = true;
  }

  closeHelpModal(): void {
    this.showHelpModal = false;
    this.selectedTask = null;
  }

  submitHelpRequest(helpRequest: HelpRequest): void {
    console.log('Solicitud de ayuda IA procesada:', helpRequest);
    // Ya la alerta fue mostrada por el modal
    this.closeHelpModal();
  }

  irATareas(): void {
    this.router.navigate(['/tareitas']);
  }
}