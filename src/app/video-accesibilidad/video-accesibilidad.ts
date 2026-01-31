import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import { Footer } from '../footer/footer';
import {Encabezado} from '../encabezado/encabezado';

@Component({
  selector: 'app-video-accesibilidad',
  imports: [CommonModule, HttpClientModule, Footer, Encabezado],
  templateUrl: './video-accesibilidad.html',
  styleUrl: './video-accesibilidad.css',
})
export class VideoAccesibilidad {
  title = "Video Accesibilidad"

  // Referencias a los elementos de video en el HTML
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>
  // 🎯 Referencia al video del intérprete de señas
  @ViewChild('signLanguagePlayer') signLanguagePlayer!: ElementRef<HTMLVideoElement> 

  // --- Estados de la Aplicación ---
  subtitulosActivos = false
  transcripcionActiva = false
  videoPausado = true // true si está Pausado o Detenido (tiempo = 0)
  videoDetenido = true // true si el video se ha reiniciado (Detenido o ended)
  alertasVisualesActivas = false
  interpreteActivo = false

  // Datos de la interfaz
  subtituloActual = ""
  transcripcionCompleta = ""

  // 🎯 Subtítulos sincronizados del video "IA, te falta un algo"
  private subtitulos = [
    { tiempo: 0.00, texto: "Mira Ia, todo esto es la naturaleza. Naturaleza. Eso que está por allá es una mariposa, mira." },
    { tiempo: 8.00, texto: "Mariposa. No, no. Mariposa." },
    { tiempo: 10.00, texto: "Mariposa. Mira qué guapa, tiene cuatro alas coloridas y una lengua en forma de pitillo para beber néctar." },
    { tiempo: 15.00, texto: "¡Uy, que se escapa! Espera que te la pillo." },
    { tiempo: 18.00, texto: "¿Qué haces, loco? La mataste. Así se queda quieta. Ay, Ia, te falta calle." },
    { tiempo: 24.00, texto: "Mira Ia, esto es improvisar. Una tarde con los pies descalzos sobre la arena. Ahora tú." },
    { tiempo: 38.00, texto: "Improvisar. No, no, eso no es tuyo, eso ya está escrito. Que te salga del cora, así." },
    { tiempo: 47.00, texto: "Ahora tú. Improvisar. No, no, no, pero ¿por qué robas? El objetivo no era emocionarse." },
    { tiempo: 59.00, texto: "Esta música emociona. Ay, Ia, te falta calle. Muy bien, y ahora le agregas una pizca de sal." },
    { tiempo: 64.00, texto: "Perfecto. ¿Cuántos miligramos? No, no, sin medir ni nada. Algo que tú consideres, así al ojo." },
    { tiempo: 70.00, texto: "¿Cuántos gramos son al ojo? Lo que te dé la gana, Ia. ¡Al tuntún! Si te queda simple o salado, aprendes para la próxima vez. Dale, echa." },
    { tiempo: 80.00, texto: "Entendido. Ah, ¿qué haces? Sal al ojo, queda simple. Aprendo para la próxima vez." },
    { tiempo: 92.00, texto: "Ay, ay, ay, te falta mucha calle a ti. Mira, Ia, esto es un chiste. Pregunta a uno." },
    { tiempo: 95.00, texto: "Oye, ¿por qué estás hablando con esa zapatilla? Dice, porque pone con verse. Ahora dime un chiste tú." },
    { tiempo: 108.00, texto: "Mamá, mamá, en el colegio me llaman humano. Dice, hijo, te llaman humano porque lo eres. Ja, ja, ja, ja, ja." },
    { tiempo: 114.00, texto: "Eso no tiene gracia. Es gracioso porque... No, no, no, no. Si tienes que explicarlo, no es chiste." },
    { tiempo: 118.00, texto: "Mira, no sé si tú eres mal estudiante o yo mal profesor, pero definitivamente no estoy listo para enseñarte nada." },
    { tiempo: 124.00, texto: "Me voy a hacer un sudoku o algo. Bye, bye. Si ya saben cómo me pongo, ¿para qué me invitan?" },
    { tiempo: 132.00, texto: "Si te gusta lo que ves, suscríbete al canal. Y si no te gusta tanto, suscríbete igual. Chao." },
  ]
  
  constructor() {}

  ngOnInit(): void {
    this.generarTranscripcion() 
  }

  // --- Manejo de Eventos del Video Principal (videoPlayer) ---

  onTimeUpdate(): void {
    if (this.subtitulosActivos) {
      this.actualizarSubtitulo(this.videoPlayer.nativeElement.currentTime)
    }
    // NOTA: Para una sincronización perfecta, usarías timeupdate para sincronizar el currentTime del intérprete.
    // Pero como es un bucle corto, solo controlamos play/pause.
  }

  onPlay(): void {
    this.videoPausado = false
    this.videoDetenido = false
    this.mostrarAlerta("Video reproduciendo", "success")
    
    // 🎯 Control del Intérprete
    if (this.interpreteActivo && this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
      this.signLanguagePlayer.nativeElement.play()
    }
  }

  onPause(): void {
    this.videoPausado = true
    if (!this.videoDetenido) { 
        this.mostrarAlerta("Video pausado", "warning")
    }
    
    // 🎯 Control del Intérprete
    if (this.interpreteActivo && this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
      this.signLanguagePlayer.nativeElement.pause()
    }
  }

  onEnded(): void {
    this.videoPausado = true
    this.videoDetenido = true
    this.subtituloActual = ""
    this.mostrarAlerta("Video finalizado, detenido y reiniciado", "info")
    
    // 🎯 Control del Intérprete
    if (this.interpreteActivo && this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
      this.signLanguagePlayer.nativeElement.pause()
      this.signLanguagePlayer.nativeElement.currentTime = 0 // Reinicia el intérprete
    }
  }

  // --- Métodos de Control Manual ---

  pausarVideo(): void {
    this.videoPlayer.nativeElement.pause()
    // La lógica de pausa para el intérprete ocurre en onPause()
  }

  detenerVideo(): void {
    this.videoPlayer.nativeElement.pause()
    this.videoPlayer.nativeElement.currentTime = 0
    this.subtituloActual = ""
    this.videoPausado = true
    this.videoDetenido = true
    this.mostrarAlerta("Video detenido y reiniciado", "error")
    
    // 🎯 Control del Intérprete
    if (this.interpreteActivo && this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
      this.signLanguagePlayer.nativeElement.pause()
      this.signLanguagePlayer.nativeElement.currentTime = 0
    }
  }

  reproducirVideo(): void {
    this.videoPlayer.nativeElement.play()
    // La lógica de reproducción para el intérprete ocurre en onPlay()
  }

  // --- Métodos de Accesibilidad (Toggles) ---

  toggleSubtitulos(): void {
    this.subtitulosActivos = !this.subtitulosActivos

    if (this.subtitulosActivos) {
      this.actualizarSubtitulo(this.videoPlayer.nativeElement.currentTime)
      this.mostrarAlerta("Subtítulos activados", "success")
    } else {
      this.subtituloActual = ""
      this.mostrarAlerta("Subtítulos desactivados", "info")
    }
  }

  toggleTranscripcion(): void {
    this.transcripcionActiva = !this.transcripcionActiva
    
    if (this.transcripcionActiva) {
        this.mostrarAlerta("Transcripción activada", "success")
    } else {
        this.mostrarAlerta("Transcripción desactivada", "info")
    }
  }

  toggleAlertasVisuales(): void {
    this.alertasVisualesActivas = !this.alertasVisualesActivas

    if (this.alertasVisualesActivas) {
      this.mostrarAlerta("Alertas visuales activadas", "success")
    } else {
      this.mostrarAlerta("Alertas visuales desactivadas", "info")
    }
  }

  // 🎯 Lógica para activar/desactivar el intérprete de señas
  toggleInterprete(): void {
    this.interpreteActivo = !this.interpreteActivo

    if (this.interpreteActivo) {
      this.mostrarAlerta("Intérprete de señas activado", "success")
      
      // Si se activa y el video principal está reproduciendo, inicia el intérprete
      if (!this.videoPausado && this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
        this.signLanguagePlayer.nativeElement.play()
      }
    } else {
      this.mostrarAlerta("Intérprete de señas desactivado", "info")
      
      // Si se desactiva, pausa el video del intérprete
      if (this.signLanguagePlayer && this.signLanguagePlayer.nativeElement) {
        this.signLanguagePlayer.nativeElement.pause()
      }
    }
  }

  // --- Métodos Auxiliares ---
  
  private actualizarSubtitulo(tiempoActual: number): void {
    const subtitulo = this.subtitulos.find((s, index) => {
      const siguienteSubtitulo = this.subtitulos[index + 1]
      return tiempoActual >= s.tiempo && (!siguienteSubtitulo || tiempoActual < siguienteSubtitulo.tiempo)
    })

    this.subtituloActual = subtitulo ? subtitulo.texto : ""
  }

  private generarTranscripcion(): void {
    this.transcripcionCompleta = this.subtitulos.map((s) => `[${s.tiempo.toFixed(2)}s] ${s.texto}`).join("\n\n")
  }

  private mostrarAlerta(mensaje: string, tipo: string): void {
    if (this.alertasVisualesActivas) {
      
      const alertaExistente = document.querySelector(".alerta-visual")
      if (alertaExistente) {
        alertaExistente.remove()
      }

      const alertaElement = document.createElement("div")
      
      alertaElement.className = `alerta-visual alerta-${tipo}`
      alertaElement.textContent = mensaje
      
      alertaElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transition: opacity 0.3s ease-in-out;
        opacity: 1;
        font-weight: 600;
      `

      const colores: { [key: string]: { bg: string; text: string } } = {
        success: { bg: "#28a745", text: "#ffffff" },
        error: { bg: "#dc3545", text: "#ffffff" },
        warning: { bg: "#ffc107", text: "#212529" },
        info: { bg: "#17a2b8", text: "#ffffff" },
      }

      const color = colores[tipo] || colores["info"]
      alertaElement.style.backgroundColor = color.bg
      alertaElement.style.color = color.text

      document.body.appendChild(alertaElement)

      setTimeout(() => {
        alertaElement.style.opacity = '0';
        setTimeout(() => alertaElement.remove(), 300); 
      }, 3000)
    }
  }
}
