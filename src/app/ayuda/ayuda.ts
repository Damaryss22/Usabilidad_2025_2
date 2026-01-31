import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-help-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ayuda.html',
  styleUrls: ['./ayuda.css']
})
export class Ayuda {
  @Input() task!: Task;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<HelpRequest>();

  tipoAyuda = 'explicacion';
  mensaje = '';
  enviandoIA = false;
  userEmail = '';

  tiposAyuda = [
    { value: 'explicacion', label: 'Explicación del tema' },
    { value: 'revision', label: 'Revisión de mi trabajo' },
    { value: 'organizacion', label: 'Ayuda con organización' },
    { value: 'recursos', label: 'Recursos adicionales' }
  ];

  ngOnInit() {
    const sesion = localStorage.getItem('usuarioActivo');
    if (sesion) {
      const usuario = JSON.parse(sesion);
      // Extraer email de cualquiera de las propiedades posibles
      this.userEmail = usuario.usuario || usuario.email || usuario.correo || 'correo@ejemplo.com';
    }
  }

  onClose(): void {
    if (!this.enviandoIA) {
      this.close.emit();
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (!this.mensaje.trim()) {
      alert('Por favor describe tu duda o problema');
      return;
    }

    this.enviandoIA = true;

    // Simulación de Análisis IA
    setTimeout(() => {
        this.enviandoIA = false;
        
        // Simulación del contenido del correo
        const contenidoCorreo = `
==================================================================
📧 [SIMULACIÓN] CORREO ENVIADO A: ${this.userEmail}
ASUNTO: 🤖 Ayuda IA para la tarea: ${this.task.nombre}
==================================================================

Hola,

Hemos analizado tu dificultad con: "${this.mensaje}"

GUÍA SUGERIDA:
1. Revisa los conceptos fundamentales de ${this.task.materia}.
2. Divide el problema en pasos más pequeños.
3. Intenta resolver un ejercicio similar (Ejemplo #4 del libro).

RECURSOS RECOMENDADOS:
- 📺 Video Complementario: https://youtube.com/watch?v=ejemplo
- 📖 Lectura: Capítulo 4, Sección 2.

Atte, 
Tu Asistente Virtual
==================================================================
        `;

        console.log(contenidoCorreo);

        const mensajeConfirmacion = `
        🤖 Análisis IA Completado
        
        Hemos analizado tu solicitud sobre "${this.task.nombre}".
        
        Se ha enviado un correo a ${this.userEmail} con:
        1. Explicación detallada del concepto.
        2. Pasos sugeridos para resolver el problema.
        3. Enlaces a videos tutoriales y material de lectura recomendado.
        
        (Nota: Al ser una versión de prueba, revisa la CONSOLA del navegador para ver el contenido simulado del correo).
        `;
        
        alert(mensajeConfirmacion);

        const helpRequest: HelpRequest = {
          task: this.task,
          tipoAyuda: this.tipoAyuda,
          mensaje: this.mensaje
        };

        this.submit.emit(helpRequest);
        
        // Limpiar el formulario después de enviar
        this.mensaje = '';
        this.tipoAyuda = 'explicacion';
    }, 2500);
  }
}