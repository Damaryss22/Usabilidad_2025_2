import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Encabezado } from '../encabezado/encabezado';

interface Usuario {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  carrera: string;
  semestre: number;
  avatar: string;
  bio?: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  usuario: Usuario = {
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan.perez@universidad.edu',
    telefono: '+593 99 123 4567',
    direccion: 'Quito, Ecuador',
    fechaNacimiento: '2002-05-15',
    carrera: 'Ingeniería en Sistemas',
    semestre: 5,
    avatar: '',
    bio: ''
  };

  editMode = false;
  passwordMode = false;
  
  // Datos temporales para edición
  usuarioTemp: Usuario = { ...this.usuario };
  
  // Cambio de contraseña
  passwordData = {
    actual: '',
    nueva: '',
    confirmar: ''
  };

  estadisticas = {
    tareasCompletadas: 0,
    promedio: 0,
    materiasActivas: 0,
    horasEstudio: 0
  };

  ngOnInit(): void {
    // Cargar datos del usuario desde localStorage o servicio
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    if (typeof localStorage === 'undefined') return;

    // 1. Obtener sesión activa
    const sesionStr = localStorage.getItem('usuarioActivo');
    if (!sesionStr) return;

    const sesion = JSON.parse(sesionStr);
    // Intentar obtener el identificador (usuario o email)
    const emailActivo = sesion.usuario || sesion.email || sesion.correo;

    if (!emailActivo) {
        console.warn('No se encontró identificador de usuario en la sesión');
        return;
    }

    // 2. Buscar datos completos en 'usuarios' registrados
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      const usuarios = JSON.parse(usuariosStr);
      const usuarioCompleto = usuarios.find((u: any) => 
        (u.email && u.email.toLowerCase() === emailActivo.toLowerCase()) ||
        (u.correo && u.correo.toLowerCase() === emailActivo.toLowerCase())
      );
      
      if (usuarioCompleto) {
        // Encontramos al usuario completo, actualizamos todo
        this.usuario = {
          ...this.usuario, // Mantener estructura base
          ...usuarioCompleto // Sobrescribir con datos reales
        };
        console.log('Perfil cargado desde registro:', this.usuario);

        // 3. Calcular estadísticas basadas en las tareas del usuario
        if (usuarioCompleto.tareas && Array.isArray(usuarioCompleto.tareas)) {
          this.calcularEstadisticas(usuarioCompleto.tareas);
        } else {
          this.calcularEstadisticas([]);
        }

      } else {
        // Fallback: usar datos básicos de la sesión
        console.warn('Usuario no encontrado en registros, usando datos de sesión');
        this.usuario.nombre = sesion.nombre || this.usuario.nombre;
        this.usuario.email = sesion.usuario || this.usuario.email;
        this.calcularEstadisticas([]);
      }
    } else {
        // Si no hay lista de usuarios (ej. admin o primer uso raro)
        this.usuario.nombre = sesion.nombre || this.usuario.nombre;
        this.usuario.email = sesion.usuario || this.usuario.email;
        this.calcularEstadisticas([]);
    }
    
    // Inicializar temporal
    this.usuarioTemp = { ...this.usuario };
  }

  calcularEstadisticas(tareas: any[]): void {
    if (!tareas || tareas.length === 0) {
      this.estadisticas = {
        tareasCompletadas: 0,
        promedio: 0, // 0% de cumplimiento
        materiasActivas: 0,
        horasEstudio: 0
      };
      return;
    }

    const completadas = tareas.filter(t => t.completada).length;
    const total = tareas.length;
    
    // Promedio de cumplimiento
    const promedio = total > 0 ? Math.round((completadas / total) * 100) : 0;

    // Materias activas (contar IDs o Nombres únicos)
    const materiasUnicas = new Set(tareas.map(t => t.materiaId || t.materiaNombre).filter(m => m));
    const materiasActivas = materiasUnicas.size;

    // Estimación horas estudio: 2h por tarea completada + 1h por pendiente
    // O simplemente algo basado en completadas como "Horas Productivas"
    const horasEstudio = completadas * 2; 

    this.estadisticas = {
      tareasCompletadas: completadas,
      promedio: promedio,
      materiasActivas: materiasActivas,
      horasEstudio: horasEstudio
    };
  }

  activarEdicion(): void {
    this.editMode = true;
    this.usuarioTemp = { ...this.usuario };
  }

  cancelarEdicion(): void {
    this.editMode = false;
    this.usuarioTemp = { ...this.usuario };
  }

  guardarCambios(): void {
    if (!this.usuarioTemp.nombre || !this.usuarioTemp.email) {
      alert('Nombre y correo son obligatorios');
      return;
    }

    // 0. Capturar el email anterior para buscar en la BD antes de actualizar el objeto local
    const emailAnterior = this.usuario.email;

    // Actualizar estado local
    this.usuario = { ...this.usuarioTemp };
    this.editMode = false;
    
    // 1. Actualizar Sesión Activa (usuarioActivo)
    const sesionStr = localStorage.getItem('usuarioActivo');
    let sesionActual = sesionStr ? JSON.parse(sesionStr) : {};
    
    // Actualizamos visual y sesion
    sesionActual.nombre = this.usuario.nombre;
    sesionActual.email = this.usuario.email;
    sesionActual.correo = this.usuario.email; // Asegurar consistencia
    sesionActual.carrera = this.usuario.carrera;
    sesionActual.semestre = this.usuario.semestre;
    sesionActual.bio = this.usuario.bio;
    
    // Actualizar el identificador de login 'usuario' si coincidía con el email anterior
    // O simplemente forzarlo a ser el nuevo email para estandarizar
    if (sesionActual.usuario === emailAnterior || !sesionActual.usuario) {
        sesionActual.usuario = this.usuario.email;
    }
    
    localStorage.setItem('usuarioActivo', JSON.stringify(sesionActual));

    // 2. Actualizar Base de Datos (usuarios)
    const usuariosStr = localStorage.getItem('usuarios');
    if (usuariosStr) {
      let usuarios = JSON.parse(usuariosStr);
      
      // Buscamos por el email ANTERIOR para encontrar el registro correcto
      const index = usuarios.findIndex((u: any) => 
        (u.email && u.email.toLowerCase() === emailAnterior.toLowerCase()) ||
        (u.correo && u.correo.toLowerCase() === emailAnterior.toLowerCase()) || 
        (u.usuario && u.usuario.toLowerCase() === emailAnterior.toLowerCase())
      );

      if (index !== -1) {
        // Actualizar datos del usuario existente
        usuarios[index].nombre = this.usuario.nombre;
        usuarios[index].apellido = this.usuario.apellido;
        usuarios[index].usuario = this.usuario.email; // Actualizar login ID
        usuarios[index].email = this.usuario.email;   // Actualizar email
        usuarios[index].correo = this.usuario.email;  // Actualizar alias correo
        usuarios[index].carrera = this.usuario.carrera;
        usuarios[index].semestre = this.usuario.semestre;
        usuarios[index].bio = this.usuario.bio;
        usuarios[index].telefono = this.usuario.telefono;
        usuarios[index].direccion = this.usuario.direccion;
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
      } else {
        console.warn('No se encontró el usuario en la BD con el email:', emailAnterior);
      }
    }
    
    alert('Perfil actualizado correctamente');
  }

  activarCambioPassword(): void {
    this.passwordMode = true;
    this.passwordData = { actual: '', nueva: '', confirmar: '' };
  }

  cancelarCambioPassword(): void {
    this.passwordMode = false;
    this.passwordData = { actual: '', nueva: '', confirmar: '' };
  }

  cambiarPassword(): void {
    if (this.passwordData.nueva !== this.passwordData.confirmar) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.passwordData.nueva.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // 1. Verificar contraseña actual (Simulado contra datos guardados en usuarios array)
    // En un sistema real esto va al backend.
    const usuariosStr = localStorage.getItem('usuarios');
    if (!usuariosStr) {
        alert('Error al acceder a los datos de usuario');
        return;
    }

    let usuarios = JSON.parse(usuariosStr);
    const index = usuarios.findIndex((u: any) => 
       (u.email && u.email.toLowerCase() === this.usuario.email.toLowerCase()) || 
       (u.correo && u.correo.toLowerCase() === this.usuario.email.toLowerCase())
    );

    if (index !== -1) {
        // Verificar si la contraseña actual coincide (si el usuario tiene contraseña guardada)
        const usuarioDB = usuarios[index];
        if (usuarioDB.contrasena && usuarioDB.contrasena !== this.passwordData.actual) {
            alert('La contraseña actual es incorrecta');
            return;
        }

        // Actualizar contraseña
        usuarios[index].contrasena = this.passwordData.nueva;
        
        // Guardar persistencia
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        alert('Contraseña actualizada correctamente');
        this.passwordMode = false;
        this.passwordData = { actual: '', nueva: '', confirmar: '' };
        
    } else {
        alert('Usuario no encontrado en la base de datos local');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuarioTemp.avatar = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }
}
