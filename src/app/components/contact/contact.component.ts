import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CrisisService } from '../../services/crisis.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  crisisForm!: FormGroup;
  categories: string[] = [
    'NATURAL_DISASTER',
    'FOOD_STORAGE',
    'PANDEMIC',
    'MEDICAL_STORAGE',
    'OTHER'
  ];
  isLoading = false;
  isSubmitted = false;
  map: any;
  marker: any;
  imageFile: File | null = null;
  capturedImage: string | ArrayBuffer | null = null;
  videoElement!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;

  constructor(
    private fb: FormBuilder,
    private crisisService: CrisisService,
    private toastr: ToastrService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMap();
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
    console.log("Form submitted");

    this.isSubmitted = true;
  
    if (this.crisisForm.invalid) {
      return;
    }
  
    this.isLoading = true;
    const formData = this.crisisForm.getRawValue();
  
    this.crisisService.addCrisis(formData, this.imageFile).subscribe({
      next: () => {
        this.toastr.success('Crisis reported successfully!');
        this.crisisForm.reset();
        this.isSubmitted = false;
        this.imageFile = null;
        this.capturedImage = null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Something went wrong. Please try again.');
        this.isLoading = false;
      }
    });
  }
  
  

  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.crisisForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          this.updateMapMarker(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          this.toastr.warning('Unable to retrieve location. Please allow location access.');
          console.error(error);
        }
      );
    } else {
      this.toastr.warning('Geolocation is not supported by this browser.');
    }
  }

  getCoordinates(): void {
    const location = this.crisisForm.get('location')?.value;
    if (!location) return;

    this.isLoading = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        if (res.length > 0) {
          const { lat, lon } = res[0];
          this.crisisForm.patchValue({
            latitude: lat,
            longitude: lon
          });
          this.updateMapMarker(parseFloat(lat), parseFloat(lon));
          this.toastr.success('Location found!');
        } else {
          this.toastr.warning('Location not found');
        }
      },
      error: (err) => {
        this.toastr.error('Error during geocoding');
        console.error(err);
      },
      complete: () => (this.isLoading = false)
    });
  }

  startCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.autoplay = true;
      this.videoElement.width = 320;
      this.videoElement.height = 240;
  
      const container = document.getElementById('cameraContainer');
      if (container) {
        container.innerHTML = '';
        container.appendChild(this.videoElement);
      }
  
      this.canvasElement = document.createElement('canvas');
    }).catch((error) => {
      console.error('Camera access error:', error);
      this.toastr.error('Unable to access the camera.');
    });
  }
  

  captureImage(): void {
    if (this.videoElement && this.canvasElement) {
      const context = this.canvasElement.getContext('2d');
      if (context) {
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
        this.imageFile = new File([blob], 'captured_image.png', { type: 'image/png' });

        this.toastr.success('Image captured!');
      }
    }
  }

  updateMapMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.map.removeLayer(this.marker);
    }
    this.marker = L.marker([lat, lng]).addTo(this.map);
    this.map.setView([lat, lng], 13);
  }

  loadMap(): void {
    this.map = L.map('map').setView([36.8065, 10.1815], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      this.crisisForm.patchValue({
        latitude: lat,
        longitude: lng
      });

      this.updateMapMarker(lat, lng);
    });
  }

  formatEnum(value: string): string {
    return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }
}
