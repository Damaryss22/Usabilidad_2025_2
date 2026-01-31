// ============= MATERIAS.TS =============
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Encabezado } from '../encabezado/encabezado';
import { MenuComponent } from '../menu/menu';
import { Footer } from '../footer/footer';

export interface Materia {
  id: number;
  nombre: string;
  profesor: string;
  semestre: number;
  horario: string;
  aula: string;
  color: string;
  creditos: number;
  diasSemana: string[];
  descripcion?: string;
  fechaCreacion: Date;
}

export interface Tarea {
  id: number;
  titulo: string;
  materiaId: number;
  materiaNombre?: string;
  descripcion: string;
  fechaEntrega: Date;
  horaEntrega: string;
  prioridad: 'baja' | 'media' | 'alta';
  completada: boolean;
  archivoAdjunto?: File;
  nombreArchivo?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-materias',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado, MenuComponent, Footer],
  templateUrl: './materias.html',
  styleUrls: ['./materias.css']
})
export class MateriasComponent implements OnInit {
  materias: Materia[] = [];
  tareas: Tarea[] = [];
  mostrarFormulario: boolean = false;
  materiaSeleccionada: Materia | null = null;
  editando: Materia | null = null;
  busqueda: string = '';
  materiasFiltradas: Materia[] = [];

  nuevaMateria: Materia = {
    id: 0,
    nombre: '',
    profesor: '',
    semestre: 1,
    horario: '',
    aula: '',
    color: '#3b82f6',
    creditos: 3,
    diasSemana: [],
    descripcion: '',
    fechaCreacion: new Date()
  };

  coloresDisponibles = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  diasSemanaOpciones = [
    { value: 'Lunes', label: 'L' },
    { value: 'Martes', label: 'M' },
    { value: 'Miércoles', label: 'X' },
    { value: 'Jueves', label: 'J' },
    { value: 'Viernes', label: 'V' },
    { value: 'Sábado', label: 'S' }
  ];

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.actualizarFiltro();
  }

  cargarDatos(): void {
    const materiasGuardadas = localStorage.getItem('materias');
    const tareasGuardadas = localStorage.getItem('tareas');
    
    if (materiasGuardadas) {
      const parsedMaterias = JSON.parse(materiasGuardadas);
      // Asegurar que diasSemana exista para evitar crash
      this.materias = parsedMaterias.map((m: any) => ({
        ...m,
        diasSemana: Array.isArray(m.diasSemana) ? m.diasSemana : []
      }));
    }
    
    if (tareasGuardadas) {
      this.tareas = JSON.parse(tareasGuardadas);
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  toggleDia(dia: string): void {
    const index = this.nuevaMateria.diasSemana.indexOf(dia);
    if (index > -1) {
      this.nuevaMateria.diasSemana = this.nuevaMateria.diasSemana.filter(d => d !== dia);
    } else {
      this.nuevaMateria.diasSemana.push(dia);
    }
  }

  isDiaSeleccionado(dia: string): boolean {
    return this.nuevaMateria.diasSemana.includes(dia);
  }

  agregarMateria(): void {
    if (!this.nuevaMateria.nombre || !this.nuevaMateria.profesor || 
        !this.nuevaMateria.horario || this.nuevaMateria.diasSemana.length === 0) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const nueva: Materia = {
      ...this.nuevaMateria,
      id: Date.now(),
      fechaCreacion: new Date()
    };

    this.materias = [...this.materias, nueva];
    this.guardarMaterias();
    this.actualizarFiltro();
    this.limpiarFormulario();
    this.mostrarFormulario = false;
    this.cd.detectChanges();
    this.mostrarNotificacion('✅ Materia agregada exitosamente');
  }

  editarMateria(materia: Materia): void {
    this.editando = { ...materia };
    this.nuevaMateria = { ...materia };
    this.mostrarFormulario = true;
  }

  guardarEdicion(): void {
    if (!this.editando) return;

    const index = this.materias.findIndex(m => m.id === this.editando!.id);
    if (index !== -1) {
      this.materias[index] = { ...this.nuevaMateria, id: this.editando.id };
      this.guardarMaterias();
      this.actualizarFiltro();
      this.limpiarFormulario();
      this.mostrarFormulario = false;
      this.editando = null;
      this.cd.detectChanges();
      this.mostrarNotificacion('💾 Materia actualizada');
    }
  }

  eliminarMateria(id: number): void {
    if (confirm('¿Está seguro de eliminar esta materia? Se eliminarán también sus tareas asociadas.')) {
      this.materias = this.materias.filter(m => m.id !== id);
      this.tareas = this.tareas.filter(t => t.materiaId !== id);
      this.guardarMaterias();
      this.guardarTareas();
      this.actualizarFiltro();
      this.cd.detectChanges();
      this.mostrarNotificacion('🗑️ Materia eliminada');
    }
  }

  seleccionarMateria(materia: Materia): void {
    this.materiaSeleccionada = this.materiaSeleccionada?.id === materia.id ? null : materia;
  }

  obtenerTareasPorMateria(materiaId: number): Tarea[] {
    return this.tareas.filter(t => t.materiaId === materiaId);
  }

  buscarMaterias(): void {
    if (!this.busqueda || !this.busqueda.trim()) {
      this.materiasFiltradas = [...this.materias];
    } else {
      const termino = this.busqueda.toLowerCase().trim();
      this.materiasFiltradas = this.materias.filter(m =>
        m.nombre.toLowerCase().includes(termino) ||
        m.profesor.toLowerCase().includes(termino) ||
        m.aula.toLowerCase().includes(termino)
      );
    }
  }

  actualizarFiltro(): void {
    this.buscarMaterias();
  }

  limpiarFormulario(): void {
    this.nuevaMateria = {
      id: 0,
      nombre: '',
      profesor: '',
      semestre: 1,
      horario: '',
      aula: '',
      color: '#3b82f6',
      creditos: 3,
      diasSemana: [],
      descripcion: '',
      fechaCreacion: new Date()
    };
    this.editando = null;
  }

  guardarMaterias(): void {
    localStorage.setItem('materias', JSON.stringify(this.materias));
  }

  guardarTareas(): void {
    localStorage.setItem('tareas', JSON.stringify(this.tareas));
  }

  mostrarNotificacion(mensaje: string): void {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.classList.add('notificacion');
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.classList.add('mostrar'), 10);
    setTimeout(() => {
      notificacion.classList.remove('mostrar');
      setTimeout(() => notificacion.remove(), 500);
    }, 3000);
  }
}