import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Footer } from '../footer/footer';
import { AccessibilityMenu } from '../accessibility-menu/accessibility-menu';

// Interfaces para tipado fuerte
interface LoginAttempt {
  timestamp: number;
  usuario: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  id: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Footer, AccessibilityMenu],
  templateUrl: './login.html',
  styleUrls: ['./login.css']  
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  errores = { usuario: '', contrasena: '' };
  
  // Sistema de notificaciones
  notifications: Notification[] = [];
  notificationCounter = 0;
  
  // Sistema de bloqueo temporal
  intentosFallidos = 0;
  bloqueado = false;
  tiempoBloqueo = 0;
  tiempoRestante = 0;
  bloqueoInterval: any;
  readonly MAX_INTENTOS = 3;
  readonly TIEMPO_BLOQUEO_MS = 30000; // 30 segundos
  
  // Modal de recuperación
  mostrarModalRecuperacion = false;
  emailRecuperacion = '';
  pasoRecuperacion: 'email' | 'codigo' | 'nueva-password' = 'email';
  codigoRecuperacion = '';
  codigoGenerado = '';
  nuevaPassword = '';
  confirmarPassword = '';
  
  // Mostrar/ocultar contraseña
  mostrarPassword = false;
  mostrarNuevaPassword = false;
  mostrarConfirmarPassword = false;
  
  // Ayuda contextual
  mostrarAyudaUsuario = false;
  mostrarAyudaPassword = false;
  
  // Loading states
  cargandoLogin = false;
  cargandoRecuperacion = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Verificar si hay bloqueo activo al cargar
    this.verificarBloqueoExistente();
    
    // Configurar validación en tiempo real
    this.setupRealtimeValidation();
    
    // Añadir soporte para tecla Enter
    this.setupKeyboardSupport();
  }

  ngOnDestroy(): void {
    if (this.bloqueoInterval) {
      clearInterval(this.bloqueoInterval);
    }
  }

  /**
   * Configura la validación en tiempo real de los campos
   */
  private setupRealtimeValidation(): void {
    this.loginForm.get('usuario')?.valueChanges.subscribe(() => {
      if (this.loginForm.get('usuario')?.touched) {
        this.validarCampoUsuario();
      }
    });

    this.loginForm.get('contrasena')?.valueChanges.subscribe(() => {
      if (this.loginForm.get('contrasena')?.touched) {
        this.validarCampoPassword();
      }
    });
  }

  /**
   * Configura soporte para navegación por teclado
   */
  private setupKeyboardSupport(): void {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // La tecla Enter ya está manejada por el form submit
    // Agregamos soporte para Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mostrarModalRecuperacion) {
        this.cerrarModalRecuperacion();
      }
    });
  }

  /**
   * Verifica si existe un bloqueo activo previo
   */
  private verificarBloqueoExistente(): void {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    const bloqueoData = localStorage.getItem('loginBloqueo');
    if (bloqueoData) {
      const { timestamp, intentos } = JSON.parse(bloqueoData);
      const tiempoTranscurrido = Date.now() - timestamp;
      
      if (tiempoTranscurrido < this.TIEMPO_BLOQUEO_MS) {
        this.bloqueado = true;
        this.intentosFallidos = intentos;
        this.tiempoRestante = Math.ceil((this.TIEMPO_BLOQUEO_MS - tiempoTranscurrido) / 1000);
        this.iniciarContadorBloqueo();
        this.mostrarNotificacion(
          `Cuenta bloqueada temporalmente. Intenta en ${this.tiempoRestante} segundos.`,
          'warning'
        );
      } else {
        // Bloqueo expirado, limpiar
        localStorage.removeItem('loginBloqueo');
        this.intentosFallidos = 0;
      }
    }
  }

  /**
   * Valida el campo de usuario en tiempo real
   */
  private validarCampoUsuario(): void {
    const usuarioControl = this.loginForm.get('usuario');
    this.errores.usuario = '';
    
    if (usuarioControl?.errors?.['required']) {
      this.errores.usuario = 'El usuario es obligatorio';
    } else if (usuarioControl?.errors?.['minlength']) {
      this.errores.usuario = 'El usuario debe tener al menos 3 caracteres';
    }
  }

  /**
   * Valida el campo de contraseña en tiempo real
   */
  private validarCampoPassword(): void {
    const passwordControl = this.loginForm.get('contrasena');
    this.errores.contrasena = '';
    
    if (passwordControl?.errors?.['required']) {
      this.errores.contrasena = 'La contraseña es obligatoria';
    } else if (passwordControl?.errors?.['minlength']) {
      this.errores.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
  }

  /**
   * Inicio de sesión con validación completa
   */
  public iniciarSesion(): void {
    // Verificar si está bloqueado
    if (this.bloqueado) {
      this.mostrarNotificacion(
        `Demasiados intentos fallidos. Espera ${this.tiempoRestante} segundos.`,
        'error'
      );
      return;
    }

    // Marcar campos como touched para mostrar errores
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });

    // Validar formulario
    this.errores = { usuario: '', contrasena: '' };
    this.validarCampoUsuario();
    this.validarCampoPassword();

    if (this.loginForm.invalid) {
      this.mostrarNotificacion('Por favor completa todos los campos correctamente', 'warning');
      return;
    }

    this.cargandoLogin = true;

    const usuario = this.loginForm.get('usuario')?.value.trim();
    const contrasena = this.loginForm.get('contrasena')?.value;

    // Simular delay de autenticación (UX)
    setTimeout(() => {
      this.procesarAutenticacion(usuario, contrasena);
    }, 500);
  }

  /**
   * Procesa la autenticación del usuario
   */
  private procesarAutenticacion(usuario: string, contrasena: string): void {
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.cargandoLogin = false;
      return;
    }

    // 1️⃣ Caso especial: administrador
    if (usuario === 'admin' && contrasena === 'admin123') {
      this.autenticacionExitosa('admin', 'Administrador', 'admin', '/administrador');
      return;
    }

    // 2️⃣ Buscar estudiantes registrados
    const usuariosGuardados = localStorage.getItem('usuarios');
    const usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    

    // Debug: mostrar usuarios en consola
    console.log('=== DEBUG LOGIN ===');
    console.log('Intentando login con:', usuario);
    console.log('Total usuarios registrados:', usuarios.length);
    console.log('Usuarios en localStorage:', usuarios.map((u: any) => ({ email: u.email, nombre: u.nombre })));

    const estudiante = usuarios.find(
      (u: any) => u.email.trim().toLowerCase() === usuario.toLowerCase()
    );

    console.log('Usuario encontrado:', estudiante ? 'SÍ' : 'NO');
    if (estudiante) {
      console.log('Datos del usuario encontrado:', {
        email: estudiante.email,
        nombre: estudiante.nombre,
        passwordMatch: contrasena === estudiante.password
      });
    }

    // 3️⃣ Validar existencia
    if (!estudiante) {
      console.log('Error: Usuario no encontrado');
      this.autenticacionFallida('Usuario no encontrado', 'usuario');
      return;
    }

    // 4️⃣ Validar contraseña
    if (contrasena !== estudiante.password) {
      console.log('Error: Contraseña incorrecta');
      console.log('Contraseña ingresada:', contrasena);
      console.log('Contraseña guardada:', estudiante.password);
      this.autenticacionFallida('Contraseña incorrecta', 'contrasena');
      return;
    }

    // 5️⃣ Autenticación exitosa
    console.log('Login exitoso!');
    this.autenticacionExitosa(estudiante.email, estudiante.nombre, 'estudiante', '/alumnos');
  }

  /**
   * Maneja autenticación exitosa
   */
  private autenticacionExitosa(usuario: string, nombre: string, rol: string, ruta: string): void {
    this.cargandoLogin = false;
    
    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    // Limpiar intentos fallidos
    this.intentosFallidos = 0;
    localStorage.removeItem('loginBloqueo');

    // Guardar sesión
    const usuarioData = { usuario, nombre, rol };
    if (rol === 'admin') {
      localStorage.setItem('adminLogged', 'true');
    }
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioData));
    localStorage.setItem('tipoUsuario', rol);

    // Notificación de éxito
    this.mostrarNotificacion(`¡Bienvenido ${nombre}!`, 'success');

    // Redirigir después de un breve delay
    setTimeout(() => {
      this.router.navigate([ruta]);
    }, 1000);
  }

  /**
   * Maneja autenticación fallida con bloqueo
   */
  private autenticacionFallida(mensaje: string, campo: 'usuario' | 'contrasena'): void {
    this.cargandoLogin = false;
    this.intentosFallidos++;
    
    // Actualizar error del campo específico
    if (campo === 'usuario') {
      this.errores.usuario = mensaje;
    } else {
      this.errores.contrasena = mensaje;
    }

    // Verificar si se alcanzó el límite de intentos
    if (this.intentosFallidos >= this.MAX_INTENTOS) {
      this.bloquearTemporalmente();
    } else {
      const intentosRestantes = this.MAX_INTENTOS - this.intentosFallidos;
      this.mostrarNotificacion(
        `${mensaje}. Te quedan ${intentosRestantes} intento(s).`,
        'error'
      );
    }
  }

  /**
   * Bloquea temporalmente el inicio de sesión
   */
  private bloquearTemporalmente(): void {
    this.bloqueado = true;
    this.tiempoRestante = this.TIEMPO_BLOQUEO_MS / 1000;

    // Guardar en localStorage si estamos en el navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const bloqueoData = {
        timestamp: Date.now(),
        intentos: this.intentosFallidos
      };
      localStorage.setItem('loginBloqueo', JSON.stringify(bloqueoData));
    }

    // Iniciar contador
    this.iniciarContadorBloqueo();

    // Notificación
    this.mostrarNotificacion(
      `Demasiados intentos fallidos. Cuenta bloqueada por ${this.tiempoRestante} segundos.`,
      'error'
    );

    // Limpiar formulario
    this.loginForm.reset();
  }

  /**
   * Inicia el contador de bloqueo
   */
  private iniciarContadorBloqueo(): void {
    this.bloqueoInterval = setInterval(() => {
      this.tiempoRestante--;
      
      if (this.tiempoRestante <= 0) {
        this.desbloquear();
      }
    }, 1000);
  }

  /**
   * Desbloquea el inicio de sesión
   */
  private desbloquear(): void {
    this.bloqueado = false;
    this.intentosFallidos = 0;
    this.tiempoRestante = 0;
    
    if (this.bloqueoInterval) {
      clearInterval(this.bloqueoInterval);
    }
    
    // Remover bloqueo del localStorage si estamos en el navegador
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('loginBloqueo');
    }
    
    this.mostrarNotificacion('Cuenta desbloqueada. Puedes intentar nuevamente.', 'success');
  }

  /**
   * Sistema de notificaciones
   */
  private mostrarNotificacion(message: string, type: Notification['type']): void {
    const notification: Notification = {
      message,
      type,
      id: this.notificationCounter++
    };
    
    this.notifications.push(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      this.cerrarNotificacion(notification.id);
    }, 5000);
  }

  public cerrarNotificacion(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========

  /**
   * Abre el modal de recuperación
   */
  public abrirModalRecuperacion(): void {
    this.mostrarModalRecuperacion = true;
    this.pasoRecuperacion = 'email';
    this.emailRecuperacion = '';
    this.codigoRecuperacion = '';
    this.nuevaPassword = '';
    this.confirmarPassword = '';
  }

  /**
   * Cierra el modal de recuperación
   */
  public cerrarModalRecuperacion(): void {
    this.mostrarModalRecuperacion = false;
    this.cargandoRecuperacion = false;
  }

  /**
   * Envía el código de recuperación
   */
  public enviarCodigoRecuperacion(): void {
    if (!this.emailRecuperacion || !this.validarEmail(this.emailRecuperacion)) {
      this.mostrarNotificacion('Por favor ingresa un email válido', 'warning');
      return;
    }

    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.mostrarNotificacion('Función no disponible en el servidor', 'error');
      return;
    }

    this.cargandoRecuperacion = true;

    // Verificar si el email existe
    const usuariosGuardados = localStorage.getItem('usuarios');
    const usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    const usuarioExiste = usuarios.find(
      (u: any) => u.email.toLowerCase() === this.emailRecuperacion.toLowerCase()
    );

    setTimeout(() => {
      if (usuarioExiste) {
        // Generar código de 6 dígitos
        this.codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Mostrar código en consola con formato destacado
        console.log('%c========================================', 'color: #4CAF50; font-weight: bold;');
        console.log('%c🔐 CÓDIGO DE RECUPERACIÓN', 'color: #2196F3; font-size: 16px; font-weight: bold;');
        console.log('%c========================================', 'color: #4CAF50; font-weight: bold;');
        console.log('%cCódigo de recuperación generado:', 'color: #FF9800; font-weight: bold;');
        console.log('%c' + this.codigoGenerado, 'color: #4ade80; font-size: 24px; font-weight: bold; background: #212529; padding: 10px; border-radius: 5px;');
        console.log('%c========================================', 'color: #4CAF50; font-weight: bold;');
        console.log('%cINSTRUCCIONES:', 'color: #FF9800; font-weight: bold;');
        console.log('1. Copia este código: ' + this.codigoGenerado);
        console.log('2. Pégalo en el modal de recuperación');
        console.log('3. El código es: ' + this.codigoGenerado);
        console.log('%c========================================', 'color: #4CAF50; font-weight: bold;');
        
        this.pasoRecuperacion = 'codigo';
        this.mostrarNotificacion(
          `✅ Código generado para ${this.emailRecuperacion}. ¡MIRA LA CONSOLA (F12)!`,
          'success'
        );
      } else {
        this.mostrarNotificacion('Email no encontrado en el sistema', 'error');
      }
      this.cargandoRecuperacion = false;
    }, 1000);
  }

  /**
   * Verifica el código de recuperación
   */
  public verificarCodigoRecuperacion(): void {
    if (!this.codigoRecuperacion || this.codigoRecuperacion.length !== 6) {
      this.mostrarNotificacion('Por favor ingresa un código de 6 dígitos', 'warning');
      return;
    }

    if (this.codigoRecuperacion === this.codigoGenerado) {
      this.pasoRecuperacion = 'nueva-password';
      this.mostrarNotificacion('Código verificado correctamente', 'success');
    } else {
      this.mostrarNotificacion('Código incorrecto. Intenta nuevamente.', 'error');
    }
  }

  /**
   * Restablece la contraseña
   */
  public restablecerPassword(): void {
    // Validar contraseñas
    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.mostrarNotificacion('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    if (this.nuevaPassword !== this.confirmarPassword) {
      this.mostrarNotificacion('Las contraseñas no coinciden', 'error');
      return;
    }

    // Verificar si estamos en el navegador
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.mostrarNotificacion('Función no disponible en el servidor', 'error');
      return;
    }

    this.cargandoRecuperacion = true;

    // Actualizar contraseña en localStorage
    const usuariosGuardados = localStorage.getItem('usuarios');
    const usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];
    
    const usuarioIndex = usuarios.findIndex(
      (u: any) => u.email.toLowerCase() === this.emailRecuperacion.toLowerCase()
    );

    if (usuarioIndex !== -1) {
      usuarios[usuarioIndex].password = this.nuevaPassword;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      
      setTimeout(() => {
        this.cargandoRecuperacion = false;
        this.mostrarNotificacion('Contraseña actualizada correctamente', 'success');
        this.cerrarModalRecuperacion();
      }, 1000);
    } else {
      this.cargandoRecuperacion = false;
      this.mostrarNotificacion('Error al actualizar la contraseña', 'error');
    }
  }

  /**
   * Valida formato de email
   */
  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ========== FUNCIONES DE UI ==========

  /**
   * Alterna visibilidad de contraseña
   */
  public togglePasswordVisibility(field: 'login' | 'nueva' | 'confirmar'): void {
    switch (field) {
      case 'login':
        this.mostrarPassword = !this.mostrarPassword;
        break;
      case 'nueva':
        this.mostrarNuevaPassword = !this.mostrarNuevaPassword;
        break;
      case 'confirmar':
        this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
        break;
    }
  }

  /**
   * Navega al registro
   */
  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  /**
   * Muestra/oculta ayuda contextual
   */
  public toggleAyuda(campo: 'usuario' | 'password'): void {
    if (campo === 'usuario') {
      this.mostrarAyudaUsuario = !this.mostrarAyudaUsuario;
    } else {
      this.mostrarAyudaPassword = !this.mostrarAyudaPassword;
    }
  }
}
