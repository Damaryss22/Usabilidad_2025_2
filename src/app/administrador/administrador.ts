import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Encabezado } from '../encabezado/encabezado';

interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  nombreUsuario: string;
  email: string;
  password: string;
  carrera: string;
  semestre: number;
  fechaRegistro: Date;
  rol?: string; // opcional por si quieres distinguir admin/estudiante
}

@Component({
  selector: 'app-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule, Encabezado],
  templateUrl: './administrador.html',
  styleUrls: ['./administrador.css']
})
export class AdministradorComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  nuevoUsuario: Usuario = { 
    id: 0, 
    nombres: '', 
    apellidos: '',
    nombreUsuario: '',
    email: '', 
    password: '',
    carrera: '',
    semestre: 1,
    fechaRegistro: new Date(),
    rol: 'estudiante'
  };
  editando: Usuario | null = null;
  busqueda: string = '';
  mostrarFormulario: boolean = false;
  ordenarPor: 'nombres' | 'email' | 'fecha' = 'nombres';
  ordenAscendente: boolean = true;
  fechaActual: Date = new Date();
  mostrarPassword: boolean = false;
  editandoPasswordNueva: string = '';
  mostrarPasswordEdicion: boolean = false;


  constructor(private router: Router, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo') || 'null');
      const adminLogged = localStorage.getItem('adminLogged') === 'true';
      const esAdminPorUsuario = usuarioActivo && usuarioActivo.rol === 'admin';

      if (!esAdminPorUsuario && !adminLogged) {
        alert('Acceso denegado. Solo el administrador puede ingresar aquí.');
        this.router.navigate(['/login']);
        return;
      }

      // Cargar usuarios desde localStorage
      this.cargarUsuarios();
      this.actualizarFiltro();
    }
  }

  cargarUsuarios(): void {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
      try {
        this.usuarios = JSON.parse(usuariosGuardados);
        console.log('Usuarios cargados:', this.usuarios.length);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.usuarios = [];
      }
    } else {
      this.usuarios = [];
      console.log('No hay usuarios guardados');
    }
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.limpiarFormulario();
    }
  }

  togglePasswordVisibility() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  togglePasswordEdicion() {
    this.mostrarPasswordEdicion = !this.mostrarPasswordEdicion;
  }

  agregarUsuario() {
    if (!this.nuevoUsuario.nombres || !this.nuevoUsuario.apellidos || 
        !this.nuevoUsuario.nombreUsuario || !this.nuevoUsuario.email || 
        !this.nuevoUsuario.password || !this.nuevoUsuario.carrera) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.nuevoUsuario.email)) {
      alert('Por favor ingrese un email válido');
      return;
    }

    if (this.nuevoUsuario.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.nuevoUsuario.semestre < 1 || this.nuevoUsuario.semestre > 10) {
      alert('El semestre debe estar entre 1 y 10');
      return;
    }

    if (this.usuarios.some(u => u.nombreUsuario === this.nuevoUsuario.nombreUsuario)) {
      alert('El nombre de usuario ya está en uso');
      return;
    }

    if (this.usuarios.some(u => u.email === this.nuevoUsuario.email)) {
      alert('El email ya está registrado');
      return;
    }

    const nuevo: Usuario = { 
      ...this.nuevoUsuario, 
      id: Date.now(),
      fechaRegistro: new Date(),
      rol: 'estudiante'
    };
    
    this.usuarios = [...this.usuarios, nuevo];
    this.actualizarFiltro();
    console.log('Usuario agregado:', nuevo);
    
    this.guardarEnLocalStorage();
    this.limpiarFormulario();
    this.mostrarFormulario = false;
    this.actualizarFiltro();
    
    this.mostrarNotificacion('✅ Usuario agregado exitosamente');
  }

  limpiarFormulario() {
    this.nuevoUsuario = { 
      id: 0, 
      nombres: '', 
      apellidos: '',
      nombreUsuario: '',
      email: '', 
      password: '',
      carrera: '',
      semestre: 1,
      fechaRegistro: new Date(),
      rol: 'estudiante'
    };
    this.mostrarPassword = false;
  }

  editarUsuario(usuario: Usuario) {
    this.editando = { ...usuario };
  }

  guardarEdicion() {
    if (!this.editando) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.editando.email)) {
      alert('Por favor ingrese un email válido');
      return;
    }

    if (this.editando.semestre < 1 || this.editando.semestre > 10) {
      alert('El semestre debe estar entre 1 y 10');
      return;
    }

    if (this.editandoPasswordNueva && this.editandoPasswordNueva.length < 6) {
      alert('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (this.usuarios.some(u => u.nombreUsuario === this.editando!.nombreUsuario && u.id !== this.editando!.id)) {
      alert('El nombre de usuario ya está en uso');
      return;
    }

    if (this.usuarios.some(u => u.email === this.editando!.email && u.id !== this.editando!.id)) {
      alert('El email ya está registrado');
      return;
    }

    const index = this.usuarios.findIndex(u => u.id === this.editando!.id);
    if (index !== -1) {
      if (this.editandoPasswordNueva.trim() !== '') {
        this.editando.password = this.editandoPasswordNueva;
      } else {
        this.editando.password = this.usuarios[index].password;
      }

      this.usuarios = [
        ...this.usuarios.slice(0, index),
        this.editando!,
        ...this.usuarios.slice(index + 1)
      ];
      this.actualizarFiltro();
      this.guardarEnLocalStorage();
      this.actualizarFiltro();

      this.mostrarNotificacion('💾 Cambios guardados correctamente');
    }

    this.editando = null;
    this.editandoPasswordNueva = '';
    this.mostrarPasswordEdicion = false;
  }

  cancelarEdicion() {
    this.editando = null;
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usuarios = this.usuarios.filter(u => u.id !== id);
      this.guardarEnLocalStorage();
      this.actualizarFiltro();
      this.mostrarNotificacion('🗑️ Usuario eliminado');
    }
  }

  buscarUsuarios() {
    if (!this.busqueda || !this.busqueda.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
    } else {
      const termino = this.busqueda.toLowerCase().trim();
      this.usuariosFiltrados = this.usuarios.filter(u => 
        (u.nombres && u.nombres.toLowerCase().includes(termino)) ||
        (u.apellidos && u.apellidos.toLowerCase().includes(termino)) ||
        (u.nombreUsuario && u.nombreUsuario.toLowerCase().includes(termino)) ||
        (u.email && u.email.toLowerCase().includes(termino)) ||
        (u.carrera && u.carrera.toLowerCase().includes(termino))
      );
    }
    this.aplicarOrden();
  }

  ordenarTabla(campo: 'nombres' | 'email' | 'fecha') {
    if (this.ordenarPor === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenarPor = campo;
      this.ordenAscendente = true;
    }
    this.aplicarOrden();
  }

  aplicarOrden() {
    this.usuariosFiltrados.sort((a, b) => {
      let comparacion = 0;
      switch(this.ordenarPor) {
        case 'nombres':
          comparacion = (a.nombres + ' ' + a.apellidos).localeCompare(b.nombres + ' ' + b.apellidos);
          break;
        case 'email':
          comparacion = a.email.localeCompare(b.email);
          break;
        case 'fecha':
          comparacion = new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime();
          break;
      }
      return this.ordenAscendente ? comparacion : -comparacion;
    });
  }

  actualizarFiltro() {
    this.buscarUsuarios();
  }

  guardarEnLocalStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
    }
  }

  exportarCSV() {
    const headers = ['Nombres', 'Apellidos', 'Usuario', 'Email', 'Carrera', 'Semestre', 'Fecha de Registro', 'Contraseña'];
    const rows = this.usuarios.map(u => [
      u.nombres,
      u.apellidos,
      u.nombreUsuario,
      u.email,
      u.carrera,
      u.semestre.toString(),
      new Date(u.fechaRegistro).toLocaleDateString(),
      u.password
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  // 🔔 Notificación elegante (sin alert)
  mostrarNotificacion(mensaje: string) {
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
