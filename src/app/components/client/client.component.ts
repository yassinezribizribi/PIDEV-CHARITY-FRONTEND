import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { tns } from 'tiny-slider';

import ClientData from '../../../data/client.json'

@Component({
    selector: 'app-client',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './client.component.html',
    styleUrl: './client.component.scss'
})
export class ClientComponent {
  slider:any 

  ngAfterViewInit(): void {
    this.slider = tns({
      container: '.tiny-three-item',
      controls: false,
      mouseDrag: true,
      loop: true,
      rewind: true,
      autoplay: true,
      autoplayButtonOutput: false,
      autoplayTimeout: 3000,
      navPosition: "bottom",
      speed: 400,
      gutter: 12,
      responsive: {
          992: {
              items: 3
          },

          767: {
              items: 2
          },

          320: {
              items: 1
          },
      },
  });
  }
  clientData = ClientData
}
