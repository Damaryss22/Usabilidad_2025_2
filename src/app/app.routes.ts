import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { AdministradorComponent } from './administrador/administrador';
import { RegistroComponent } from './registrar/registrar';
import { AlumnosComponent } from './alumnos/alumnos';
import { PerfilComponent } from './perfil/perfil';
import { BuscarComponent } from './buscar/buscar';
import { AyuditaComponent } from './ayudita/ayudita';
import { TerminosComponent } from './terminos/terminos';
import { PrivacidadComponent } from './privacidad/privacidad';
import { MateriasComponent } from './materias/materias';
import { TareasComponent } from './tareitas/tareitas';
import { CalendarioComponent } from './calendario/calendario';
import { VideoAccesibilidad } from './video-accesibilidad/video-accesibilidad';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'administrador', component: AdministradorComponent, canActivate: [authGuard] },
  { path: 'alumnos', component: AlumnosComponent, canActivate: [authGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'buscar', component: BuscarComponent, canActivate: [authGuard] },
  { path: 'ayudita', component: AyuditaComponent, canActivate: [authGuard] },
  { path: 'terminos', component: TerminosComponent },
  { path: 'privacidad', component: PrivacidadComponent },
  { path: 'materias', component: MateriasComponent, canActivate: [authGuard] },
  { path: 'tareas', component: TareasComponent, canActivate: [authGuard] },
  { path: 'calendario', component: CalendarioComponent, canActivate: [authGuard] },
  { path: 'video-accesibilidad', component: VideoAccesibilidad },
];
