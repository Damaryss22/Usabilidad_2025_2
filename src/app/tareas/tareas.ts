// tareas.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tareas.html',
  styleUrls: ['./tareas.css']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Output() requestHelp = new EventEmitter<Task>();

  getPriorityClass(): string {
    const classes = {
      'alta': 'priority-high',
      'media': 'priority-medium',
      'baja': 'priority-low'
    };
    return classes[this.task.prioridad];
  }

  getStatusIcon(): string {
    const icons = {
      'completada': '✓',
      'pendiente': '⏱',
      'atrasada': '✗'
    };
    return icons[this.task.estado];
  }

  getStatusClass(): string {
    const classes = {
      'completada': 'status-completed',
      'pendiente': 'status-pending',
      'atrasada': 'status-late'
    };
    return classes[this.task.estado];
  }

  onRequestHelp(): void {
    this.requestHelp.emit(this.task);
  }
}