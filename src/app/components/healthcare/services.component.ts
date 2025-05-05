import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-services',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './healthcare.component.html',
    styleUrl: './services.component.scss'
})
export class ServicesComponent {
  servicesData = [
    {
      icon:'aperture',
      title:'Breakfast Programme',
      desc:"Success needs hard work. Don't listen to these 'get rich quick' schemes."
    },
    {
      icon:'send',
      title:'Food Assistance',
      desc:"Success needs hard work. Don't listen to these 'get rich quick' schemes."
    },
    {
      icon:'users',
      title:'Social Works',
      desc:"Success needs hard work. Don't listen to these 'get rich quick' schemes."
    },
  ]
}
