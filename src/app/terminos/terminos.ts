import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Encabezado } from '../encabezado/encabezado';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [CommonModule, Encabezado, Footer],
  templateUrl: './terminos.html',
  styleUrls: ['./terminos.css']
})
export class TerminosComponent {
  fechaActualizacion = '01 de Noviembre de 2025';
}
