import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CrisisService } from '../../services/crisis.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  crisisForm!: FormGroup;
  categories = ['NATURAL_DISASTER', 'FOOD_STORAGE', 'PANDEMIC', 'MEDICAL_STORAGE', 'OTHER'];
  severities = ['LOW', 'MEDIUM', 'HIGH'];
  isLoading = false;
  isSubmitted = false;
  saturatedZone: string | null = null;


  map!: L.Map;
  marker!: L.Marker;
  imageFile: File | null = null;
  capturedImage: string | ArrayBuffer | null = null;

  videoElement!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;

  suggestions: any[] = [];
  showSuggestionList = false;
  suggestionTimeout: any;

  constructor(
    private fb: FormBuilder,
    private crisisService: CrisisService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initMap();
    this.loadSaturatedZones(); // 👈 Ajouter cet appel


  }

  initForm(): void {
    this.crisisForm = this.fb.group({
      categorie: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      crisisDate: ['', Validators.required],
      severity: ['', Validators.required],
      latitude: [{ value: '', disabled: true }, Validators.required],
      longitude: [{ value: '', disabled: true }, Validators.required],
      updates: [''],
      image: []
    });
  }

  get f() {
    return this.crisisForm.controls;
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.crisisForm.invalid) return;

    this.isLoading = true;
    const formData = this.crisisForm.getRawValue();

    this.crisisService.addCrisis(formData, this.imageFile).subscribe({
      next: () => {
        this.toastr.success('Crisis reported successfully!');
        this.crisisForm.reset();
        this.isSubmitted = false;
        this.imageFile = null;
        this.capturedImage = null;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Something went wrong. Please try again.');
      },
      complete: () => this.isLoading = false
    });
  }
  

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          this.crisisForm.patchValue({ latitude: coords.latitude, longitude: coords.longitude });
          this.updateMapMarker(coords.latitude, coords.longitude);
        },
        (error) => {
          this.toastr.warning('Unable to retrieve location.');
          console.error(error);
        }
      );
    } else {
      this.toastr.warning('Geolocation is not supported.');
    }
  }

  getCoordinates(): void {
    const location = this.f['location'].value;
    if (!location) return;

    this.isLoading = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (res.length > 0) {
          const { lat, lon } = res[0];
          this.crisisForm.patchValue({ latitude: lat, longitude: lon });
          this.updateMapMarker(parseFloat(lat), parseFloat(lon));
          this.toastr.success('Location found!');
        } else {
          this.toastr.warning('Location not found');
        }
      },
      error: (err) => {
        this.toastr.error('Geocoding failed');
        console.error(err);
      },
      complete: () => this.isLoading = false
    });
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.autoplay = true;

      const container = document.getElementById('cameraContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(this.videoElement);
      }

      this.canvasElement = document.createElement('canvas');
    }).catch((error) => {
      console.error('Camera error:', error);
      this.toastr.error('Unable to access the camera.');
    });
  }

  captureImage(): void {
    if (!this.videoElement || !this.canvasElement) return;

    const context = this.canvasElement.getContext('2d');
    if (!context) return;

    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    context.drawImage(this.videoElement, 0, 0);

    this.capturedImage = this.canvasElement.toDataURL('image/png');
    const byteString = atob((this.capturedImage as string).split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([uint8Array], { type: 'image/png' });
    this.imageFile = new File([blob], 'captured_image.png');

    const stream = this.videoElement.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());

    const container = document.getElementById('cameraContainer');
    if (container) container.innerHTML = '';

    this.toastr.success('Image captured successfully!');
  }

  initMap(): void {
    this.map = L.map('map').setView([36.8065, 10.1815], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    this.marker = L.marker([36.8065, 10.1815], { draggable: true }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.updateMapMarker(lat, lng);
      this.crisisForm.patchValue({ latitude: lat, longitude: lng });
    });

    this.marker.on('dragend', (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      this.crisisForm.patchValue({ latitude: lat, longitude: lng });
    });
  }

  updateMapMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
    this.map.setView([lat, lng], 13);
  }

  onLocationInput(): void {
    const query = this.f['location'].value;
    if (!query || query.length < 2) {
      this.suggestions = [];
      this.showSuggestionList = false;
      return;
    }

    if (this.suggestionTimeout) clearTimeout(this.suggestionTimeout);

    this.suggestionTimeout = setTimeout(() => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`;

      this.http.get<any[]>(url).subscribe({
        next: (res) => {
          this.suggestions = res;
          this.showSuggestionList = true;

          if (res.length > 0) {
            const first = res[0];
            this.crisisForm.patchValue({
              latitude: first.lat,
              longitude: first.lon
            });
            this.updateMapMarker(parseFloat(first.lat), parseFloat(first.lon));
          }
        },
        error: (err) => {
          console.error('Autocomplete error:', err);
          this.suggestions = [];
          this.showSuggestionList = false;
        }
      });
    }, 500);
  }

  selectSuggestion(suggestion: any): void {
    this.crisisForm.patchValue({
      location: suggestion.display_name,
      latitude: suggestion.lat,
      longitude: suggestion.lon
    });

    this.updateMapMarker(parseFloat(suggestion.lat), parseFloat(suggestion.lon));
    this.suggestions = [];
    this.showSuggestionList = false;
  }

  hideSuggestionsWithDelay(): void {
    this.suggestionTimeout = setTimeout(() => {
      this.showSuggestionList = false;
    }, 200);
  }

  showSuggestions(): void {
    if (this.suggestions.length > 0) {
      this.showSuggestionList = true;
    }
  }

  formatEnum(value: string): string {
    return value.replace(/_/g, ' ').toLowerCase();
  }
  loadSaturatedZones(): void {
    this.crisisService.getSaturatedZones().subscribe({
      next: (zones) => {
        zones.forEach(zoneName => {
          // Geocode each zone name to get its coordinates
          this.crisisService.getCoordinates(zoneName).subscribe({
            next: ({ lat, lon }) => {
              // Add a red circle for each saturated zone
              L.circle([lat, lon], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.3,
                radius: 8000 // Adjust the radius as necessary
              }).addTo(this.map).bindPopup(`Saturated Zone: ${zoneName}`);
            },
            error: (err) => {
              console.error(`Error geocoding zone "${zoneName}":`, err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error fetching saturated zones:', err);
      }
    });
  }
  
}
