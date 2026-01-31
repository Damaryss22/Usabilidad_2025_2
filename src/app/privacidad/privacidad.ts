import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Encabezado } from '../encabezado/encabezado';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [CommonModule, Encabezado, Footer],
  templateUrl: './privacidad.html',
  styleUrls: ['./privacidad.css']
})
export class PrivacidadComponent {
  fechaActualizacion = '01 de Noviembre de 2025';
}