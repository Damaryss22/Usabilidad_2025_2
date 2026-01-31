import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Verificar si estamos en el navegador
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const usuarioActivo = localStorage.getItem('usuarioActivo');
    
    if (usuarioActivo) {
      return true;
    }
  }

  // Si no está logueado, redirigir al login
  router.navigate(['/login']);
  return false;
};
