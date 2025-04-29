import { AfterViewInit, Component } from '@angular/core';
import * as L from 'leaflet';
@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit {








  constructor() {}

  ngAfterViewInit(): void {
    this.initializeMap();
  }

   initializeMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Element with id "map" not found!');
      return;
    }

    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.invalidateSize();

    const marker = L.marker([51.505, -0.09]).addTo(map);

    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      marker.setLatLng([lat, lng]);
      
    });
  }
}