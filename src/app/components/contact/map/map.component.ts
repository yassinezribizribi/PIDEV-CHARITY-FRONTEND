import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { CrisisService } from '../../../services/crisis.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map: L.Map | undefined;
  private saturationZones: string[] = [];

  constructor(private crisisService: CrisisService) {}

  ngOnInit(): void {
    this.initMap();
    this.loadSaturationZones();
  }

  private initMap(): void {
    this.map = L.map('map').setView([34.5, 9.5], 7); // Centre de la Tunisie

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadSaturationZones(): void {
    this.crisisService.getSaturatedZones().subscribe((zones: string[]) => {
      this.saturationZones = zones;
      console.log('Zones de saturation :', this.saturationZones);

      this.saturationZones.forEach((zone: string) => {
        this.geocodeAndMarkZone(zone);
      });
    });
  }

  private geocodeAndMarkZone(location: string): void {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          // ✅ Afficher un cercle rouge
          L.circle([lat, lon], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 1000
          }).addTo(this.map!).bindPopup(`Zone saturée : ${location}`);
        } else {
          console.warn(`Lieu non trouvé : ${location}`);
        }
      })
      .catch(error => {
        console.error('Erreur lors du géocodage :', error);
      });
  }
}
