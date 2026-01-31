import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-menu-item',
  standalone: true, // 👈 IMPORTANTE
  imports: [CommonModule],
  templateUrl: './item-menu.html',
  styleUrls: ['./item-menu.css']
})
export class ItemMenuComponent {
  @Input() item!: MenuItem;
}
