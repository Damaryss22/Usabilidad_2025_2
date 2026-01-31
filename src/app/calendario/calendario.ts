import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Encabezado } from '../encabezado/encabezado';
import { MenuComponent } from '../menu/menu';
import { Footer } from '../footer/footer';

interface Tarea {
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
}

interface DiaCalendario {
  fecha: Date;
  dia: number;
  mesActual: boolean;
  tareas: Tarea[];
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado, MenuComponent, Footer],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent implements OnInit {
  tareas: Tarea[] = [];
  materias: any[] = [];
  fechaActual: Date = new Date();
  mesActual: number = new Date().getMonth();
  anioActual: number = new Date().getFullYear();
  diasCalendario: DiaCalendario[] = [];
  diasSemana: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  diaSeleccionado: DiaCalendario | null = null;
  vistaActual: 'mes' | 'lista' = 'mes';

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.generarCalendario();
  }

  cargarDatos(): void {
    // 1. Cargar Materias
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
          this.tareas = usuarioActual.tareas;
          
          // Vincular información de materias visual
          this.tareas.forEach(tarea => {
            const materiaIdNum = Number(tarea.materiaId);
            const materia = this.materias.find(m => m.id === materiaIdNum);
            if (materia) {
              tarea.materiaNombre = materia.nombre;
              tarea.materiaColor = materia.color;
            }
          });
        } else {
          this.tareas = [];
        }
      } catch (e) {
        console.error('Error cargando datos del usuario en calendario:', e);
        this.tareas = [];
      }
    } else {
      this.tareas = [];
    }
  }

  generarCalendario(): void {
    this.diasCalendario = [];
    
    // Primer día del mes
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    
    // Días del mes anterior para completar la primera semana
    const diasMesAnterior = primerDia.getDay();
    const ultimoDiaMesAnterior = new Date(this.anioActual, this.mesActual, 0);
    
    for (let i = diasMesAnterior - 1; i >= 0; i--) {
      const fecha = new Date(this.anioActual, this.mesActual - 1, ultimoDiaMesAnterior.getDate() - i);
      this.diasCalendario.push({
        fecha,
        dia: fecha.getDate(),
        mesActual: false,
        tareas: this.obtenerTareasPorFecha(fecha)
      });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const fecha = new Date(this.anioActual, this.mesActual, dia);
      this.diasCalendario.push({
        fecha,
        dia,
        mesActual: true,
        tareas: this.obtenerTareasPorFecha(fecha)
      });
    }
    
    // Días del mes siguiente para completar la última semana
    const diasRestantes = 42 - this.diasCalendario.length; // 6 semanas x 7 días
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const fecha = new Date(this.anioActual, this.mesActual + 1, dia);
      this.diasCalendario.push({
        fecha,
        dia,
        mesActual: false,
        tareas: this.obtenerTareasPorFecha(fecha)
      });
    }
  }

  obtenerTareasPorFecha(fecha: Date): Tarea[] {
    const fechaStr = this.formatearFecha(fecha);
    return this.tareas.filter(t => t.fechaEntrega === fechaStr);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  mesAnterior(): void {
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
    this.generarCalendario();
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
    this.generarCalendario();
  }

  mesActualHoy(): void {
    const hoy = new Date();
    this.mesActual = hoy.getMonth();
    this.anioActual = hoy.getFullYear();
    this.generarCalendario();
  }

  seleccionarDia(dia: DiaCalendario): void {
    this.diaSeleccionado = this.diaSeleccionado?.fecha.getTime() === dia.fecha.getTime() ? null : dia;
  }

  esHoy(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }

  cambiarVista(vista: 'mes' | 'lista'): void {
    this.vistaActual = vista;
  }

  obtenerTareasProximas(): Tarea[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return this.tareas
      .filter(t => {
        const fechaTarea = new Date(t.fechaEntrega);
        return fechaTarea >= hoy && !t.completada;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fechaEntrega + ' ' + a.horaEntrega);
        const fechaB = new Date(b.fechaEntrega + ' ' + b.horaEntrega);
        return fechaA.getTime() - fechaB.getTime();
      });
  }

  toggleCompletada(tarea: Tarea): void {
    tarea.completada = !tarea.completada;
    this.guardarTareasUsuario();
    this.generarCalendario();
    this.cd.detectChanges();
  }

  guardarTareasUsuario(): void {
    const sesionActiva = localStorage.getItem('usuarioActivo');
    const usuariosRegistrados = localStorage.getItem('usuarios');

    if (sesionActiva && usuariosRegistrados) {
      const usuarioSesion = JSON.parse(sesionActiva);
      const usuarios = JSON.parse(usuariosRegistrados);

      const indiceUsuario = usuarios.findIndex((u: any) => 
        u.correo === usuarioSesion.correo || u.email === usuarioSesion.email
      );

      if (indiceUsuario !== -1) {
        // Actualizar las tareas de este usuario
        usuarios[indiceUsuario].tareas = this.tareas;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
      }
    }
  }

  getPrioridadClass(prioridad: string): string {
    return `prioridad-${prioridad}`;
  }

  getPrioridadLabel(prioridad: string): string {
    const labels = { baja: '🟢', media: '🟡', alta: '🔴' };
    return labels[prioridad as keyof typeof labels] || prioridad;
  }

  getDiasRestantes(fechaEntrega: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fechaEntrega);
    entrega.setHours(0, 0, 0, 0);
    const diff = entrega.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  irATareas(): void {
    this.router.navigate(['/tareas']);
  }
}