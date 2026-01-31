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
  archivoAdjunto?: string; // Base64 del archivo
  nombreArchivo?: string;
  tipoArchivo?: string;
  fechaCreacion: Date;
}

@Component({
  selector: 'app-tareas',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado, Footer],
  templateUrl: './tareitas.html',
  styleUrls: ['./tareitas.css']
})
export class TareasComponent implements OnInit {
  tareas: Tarea[] = [];
  materias: Materia[] = [];
  mostrarFormulario: boolean = false;
  tareaSeleccionada: Tarea | null = null;
  editando: Tarea | null = null;
  busqueda: string = '';
  filtroEstado: 'todas' | 'pendientes' | 'completadas' = 'todas';
  filtroPrioridad: 'todas' | 'baja' | 'media' | 'alta' = 'todas';
  tareasFiltradas: Tarea[] = [];

  nuevaTarea: Tarea = {
    id: 0,
    titulo: '',
    materiaId: 0,
    descripcion: '',
    fechaEntrega: '',
    horaEntrega: '23:59',
    prioridad: 'media',
    completada: false,
    fechaCreacion: new Date()
  };

  archivoSeleccionado: File | null = null;

  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.actualizarFiltro();
  }

  cargarDatos(): void {
    // 1. Cargar Materias (Globales o Default)
    const materiasGuardadas = localStorage.getItem('materias');
    
    if (materiasGuardadas) {
      const materiasCompletas = JSON.parse(materiasGuardadas);
      this.materias = materiasCompletas.map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        color: m.color
      }));
    } else {
      // Materias por defecto si no existen
      this.materias = [
        { id: 1, nombre: 'Matemáticas', color: '#EF4444' },
        { id: 2, nombre: 'Historia', color: '#F59E0B' },
        { id: 3, nombre: 'Ciencias', color: '#10B981' },
        { id: 4, nombre: 'Inglés', color: '#3B82F6' },
        { id: 5, nombre: 'Programación', color: '#6366F1' }
      ];
      localStorage.setItem('materias', JSON.stringify(this.materias));
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
          
          // Re-vincular información de materias visual
          this.tareas.forEach(tarea => {
            const materia = this.materias.find(m => m.id == tarea.materiaId); // == para permitir string/number
            if (materia) {
              tarea.materiaNombre = materia.nombre;
              tarea.materiaColor = materia.color;
            }
          });
        } else {
          this.tareas = []; // Sin tareas iniciales
        }
      } catch (e) {
        console.error('Error cargando datos del usuario:', e);
        this.tareas = [];
      }
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no debe superar los 5MB');
        return;
      }

      this.archivoSeleccionado = file;
      
      // Convertir a Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.nuevaTarea.archivoAdjunto = reader.result as string;
        this.nuevaTarea.nombreArchivo = file.name;
        this.nuevaTarea.tipoArchivo = file.type;
      };
      reader.readAsDataURL(file);
    }
  }

  eliminarArchivo(): void {
    this.archivoSeleccionado = null;
    this.nuevaTarea.archivoAdjunto = undefined;
    this.nuevaTarea.nombreArchivo = undefined;
    this.nuevaTarea.tipoArchivo = undefined;
  }

  abrirSelectorArchivo(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.click();
    }
  }

  agregarTarea(): void {
    if (!this.nuevaTarea.titulo || !this.nuevaTarea.materiaId || 
        !this.nuevaTarea.fechaEntrega || !this.nuevaTarea.descripcion) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Convertir a número por seguridad
    const materiaIdNum = Number(this.nuevaTarea.materiaId);
    const materia = this.materias.find(m => m.id === materiaIdNum);
    
    const nueva: Tarea = {
      ...this.nuevaTarea,
      id: Date.now(),
      materiaId: materiaIdNum, // Asegurar que se guarde como número
      materiaNombre: materia?.nombre,
      materiaColor: materia?.color,
      fechaCreacion: new Date()
    };

    this.tareas = [...this.tareas, nueva];
    this.guardarTareas();
    this.actualizarFiltro();
    this.limpiarFormulario();
    this.mostrarFormulario = false;
    this.cd.detectChanges();
    this.mostrarNotificacion('✅ Tarea agregada exitosamente');
  }

  editarTarea(tarea: Tarea): void {
    this.editando = { ...tarea };
    this.nuevaTarea = { ...tarea };
    this.mostrarFormulario = true;
  }

  guardarEdicion(): void {
    if (!this.editando) return;

    const materiaIdNum = Number(this.nuevaTarea.materiaId);
    const materia = this.materias.find(m => m.id === materiaIdNum);
    
    const index = this.tareas.findIndex(t => t.id === this.editando!.id);
    if (index !== -1) {
      this.tareas[index] = {
        ...this.nuevaTarea,
        id: this.editando.id,
        materiaId: materiaIdNum,
        materiaNombre: materia?.nombre,
        materiaColor: materia?.color
      };
      this.guardarTareas();
      this.actualizarFiltro();
      this.limpiarFormulario();
      this.mostrarFormulario = false;
      this.editando = null;
      this.cd.detectChanges();
      this.mostrarNotificacion('💾 Tarea actualizada');
    }
  }

  toggleCompletada(tarea: Tarea): void {
    tarea.completada = !tarea.completada;
    this.guardarTareas();
    this.actualizarFiltro();
    this.cd.detectChanges();
    this.mostrarNotificacion(tarea.completada ? '✅ Tarea completada' : '↩️ Tarea marcada como pendiente');
  }

  eliminarTarea(id: number): void {
    if (confirm('¿Está seguro de eliminar esta tarea?')) {
      this.tareas = this.tareas.filter(t => t.id !== id);
      this.guardarTareas();
      this.actualizarFiltro();
      this.cd.detectChanges();
      this.mostrarNotificacion('🗑️ Tarea eliminada');
    }
  }

  seleccionarTarea(tarea: Tarea): void {
    this.tareaSeleccionada = this.tareaSeleccionada?.id === tarea.id ? null : tarea;
  }

  descargarArchivo(tarea: Tarea): void {
    if (!tarea.archivoAdjunto) return;

    const link = document.createElement('a');
    link.href = tarea.archivoAdjunto;
    link.download = tarea.nombreArchivo || 'archivo';
    link.click();
  }

  buscarTareas(): void {
    let resultado = [...this.tareas];

    // Filtrar por búsqueda
    if (this.busqueda && this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      resultado = resultado.filter(t =>
        t.titulo.toLowerCase().includes(termino) ||
        t.descripcion.toLowerCase().includes(termino) ||
        t.materiaNombre?.toLowerCase().includes(termino)
      );
    }

    // Filtrar por estado
    if (this.filtroEstado !== 'todas') {
      resultado = resultado.filter(t => 
        this.filtroEstado === 'completadas' ? t.completada : !t.completada
      );
    }

    // Filtrar por prioridad
    if (this.filtroPrioridad !== 'todas') {
      resultado = resultado.filter(t => t.prioridad === this.filtroPrioridad);
    }

    // Ordenar por fecha de entrega
    resultado.sort((a, b) => {
      const fechaA = new Date(a.fechaEntrega + ' ' + a.horaEntrega);
      const fechaB = new Date(b.fechaEntrega + ' ' + b.horaEntrega);
      return fechaA.getTime() - fechaB.getTime();
    });

    this.tareasFiltradas = resultado;
  }

  actualizarFiltro(): void {
    this.buscarTareas();
  }

  limpiarFormulario(): void {
    this.nuevaTarea = {
      id: 0,
      titulo: '',
      materiaId: 0,
      descripcion: '',
      fechaEntrega: '',
      horaEntrega: '23:59',
      prioridad: 'media',
      completada: false,
      fechaCreacion: new Date()
    };
    this.archivoSeleccionado = null;
    this.editando = null;
  }

  guardarTareas(): void {
    const sesionActiva = localStorage.getItem('usuarioActivo');
    const usuariosRegistrados = localStorage.getItem('usuarios');

    if (sesionActiva && usuariosRegistrados) {
      try {
        const usuarioSesion = JSON.parse(sesionActiva);
        let usuarios = JSON.parse(usuariosRegistrados);
        
        const indiceUsuario = usuarios.findIndex((u: any) => 
          u.correo === usuarioSesion.correo || u.email === usuarioSesion.email
        ); // Buscar por ambos campos por si acaso

        if (indiceUsuario !== -1) {
          // Actualizar las tareas solo de este usuario
          usuarios[indiceUsuario].tareas = this.tareas;
          
          // Guardar el array de usuarios actualizado
          localStorage.setItem('usuarios', JSON.stringify(usuarios));
          
          // Debug (opcional)
          console.log('Tareas guardadas para el usuario:', usuarios[indiceUsuario].nombre);
        }
      } catch (e) {
        console.error('Error al guardar tareas del usuario:', e);
      }
    } else {
      console.warn('No hay sesión activa para guardar las tareas.');
    }
  }

  getPrioridadClass(prioridad: string): string {
    return `prioridad-${prioridad}`;
  }

  getPrioridadLabel(prioridad: string): string {
    const labels = { baja: '🟢 Baja', media: '🟡 Media', alta: '🔴 Alta' };
    return labels[prioridad as keyof typeof labels] || prioridad;
  }

  getDiasRestantes(fechaEntrega: string): number {
    const hoy = new Date();
    const entrega = new Date(fechaEntrega);
    const diff = entrega.getTime() - hoy.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
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