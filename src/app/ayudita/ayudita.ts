import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Encabezado } from '../encabezado/encabezado';
import { Footer } from '../footer/footer';

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
  expandido: boolean;
}

@Component({
  selector: 'app-ayudita',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado, Footer],
  templateUrl: './ayudita.html',
  styleUrls: ['./ayudita.css']
})
export class AyuditaComponent {
  // Contacto General
  nombre = '';
  email = '';
  mensaje = '';

  preguntasFrecuentes: PreguntaFrecuente[] = [
    {
      pregunta: '¿Cómo puedo agregar una nueva tarea?',
      respuesta: 'Para agregar una nueva tarea, ve a la sección "Tareas" y haz clic en el botón "+ Nueva Tarea". Completa los campos requeridos como nombre, materia, fecha de entrega y prioridad.',
      expandido: false
    },
    {
      pregunta: '¿Cómo cambio mi contraseña?',
      respuesta: 'Ve a tu perfil de usuario, haz clic en "Cambiar Contraseña", ingresa tu contraseña actual y luego la nueva contraseña dos veces para confirmar.',
      expandido: false
    },
    {
      pregunta: '¿Puedo recibir notificaciones de mis tareas?',
      respuesta: 'Sí, puedes configurar notificaciones en la sección de configuración. Recibirás recordatorios antes de la fecha de entrega de tus tareas.',
      expandido: false
    },
    {
      pregunta: '¿Cómo organizo mis tareas por prioridad?',
      respuesta: 'El sistema organiza automáticamente tus tareas por prioridad (alta, media, baja) y calificaciones. Las tareas con prioridad alta y calificaciones bajas aparecen primero.',
      expandido: false
    },
    {
      pregunta: '¿Qué significa el sistema de ayuda inteligente?',
      respuesta: 'El sistema analiza tus calificaciones y sugiere en qué tareas podrías necesitar ayuda adicional, permitiéndote solicitar apoyo de manera fácil y rápida.',
      expandido: false
    }
  ];

  togglePregunta(pregunta: PreguntaFrecuente): void {
    pregunta.expandido = !pregunta.expandido;
  }

  enviarConsulta(): void {
    if (!this.nombre || !this.email || !this.mensaje) {
      alert('Por favor completa todos los campos del formulario de contacto.');
      return;
    }

    console.log('Consulta enviada:', { nombre: this.nombre, email: this.email, mensaje: this.mensaje });
    alert('¡Gracias por tu consulta! Te responderemos pronto.');
    
    this.mensaje = '';
  }
}