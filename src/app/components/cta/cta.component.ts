import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { tns } from 'tiny-slider';

import ClientData from '../../../data/client.json'

@Component({
    selector: 'app-cta',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './cta.component.html',
    styleUrl: './cta.component.scss'
})
export class CtaComponent {

  clientData = ClientData

  slider:any

  ngAfterViewInit(): void {
    this.slider = tns({
      container: '.tiny-single-item',
      items: 1,
      controls: false,
      mouseDrag: true,
      loop: true,
      rewind: true,
      autoplay: true,
      autoplayButtonOutput: false,
      autoplayTimeout: 3000,
      navPosition: "bottom",
      speed: 400,
      gutter: 0,
  });
  }

}
