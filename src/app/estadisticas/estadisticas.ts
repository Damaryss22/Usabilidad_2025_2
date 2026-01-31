import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class StatCardComponent {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() value!: string;
  @Input() color!: string;

  getIconPath(): string {
    const icons: { [key: string]: string } = {
      'trending-up': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      'check-circle': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      'alert-circle': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    return icons[this.icon] || '';
  }
}