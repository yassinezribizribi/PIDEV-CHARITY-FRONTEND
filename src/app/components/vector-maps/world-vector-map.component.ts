import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world-vector-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-map-container">
      <!-- Map container -->
      <div id="world-map" [style.height]="height"></div>
      
      <!-- Legend or additional info -->
      <div class="map-info" *ngIf="showLegend">
        <div class="legend">
          <div *ngFor="let item of legendItems" class="legend-item">
            <span [style.background-color]="item.color" class="color-box"></span>
            <span>{{item.label}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .world-map-container {
      position: relative;
      width: 100%;
    }

    .map-info {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 10px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .legend {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .color-box {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }
  `]
})
export class WorldVectorMapComponent implements OnInit {
  @Input() height: string = '400px';
  @Input() showLegend: boolean = true;
  @Input() data: any[] = [];

  legendItems = [
    { color: '#E8F5E9', label: '0-20%' },
    { color: '#C8E6C9', label: '21-40%' },
    { color: '#A5D6A7', label: '41-60%' },
    { color: '#81C784', label: '61-80%' },
    { color: '#66BB6A', label: '81-100%' }
  ];

  ngOnInit() {
    this.initializeMap();
  }

  private initializeMap() {
    // Initialize map logic here
    // You can use libraries like jVectorMap or other mapping libraries
    console.log('Map initialized with data:', this.data);
  }
} 