import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home-banner',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './home-banner.component.html',
    styleUrl: './home-banner.component.scss'
})
export class HomeBannerComponent {
  isOpen:any = false;
  isLoggedIn$;

  constructor(private authService: AuthService) {
    this.isLoggedIn$ = this.authService.isAuthenticated$;
  }

  togggleModal(e:any){
    e.preventDefault();
    this.isOpen = !this.isOpen;
  }
  
  images: string[] = [
    'assets/images/hero/1.jpg',
    'assets/images/hero/2.jpg',
    'assets/images/hero/3.jpg',
    // add more images here
  ];
  currentImageIndex: number = 0;
  currentImage: string = this.images[this.currentImageIndex];

  ngOnInit() {
    this.startImageRotation();
  }

  startImageRotation() {
    setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
      this.currentImage = this.images[this.currentImageIndex];
    }, 5000); // Change image every 5 seconds
  }
}
