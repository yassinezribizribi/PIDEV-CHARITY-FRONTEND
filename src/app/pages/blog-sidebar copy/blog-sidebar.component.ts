import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { MissionService } from '../../services/mission.service';
import { Mission , MissionStatus} from '../../interfaces/mission.interface';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-blog-sidebar-copy',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        BlogSidebarsComponent,
        FooterComponent,
        ScrollToTopComponent,
        FormsModule
    ],
    templateUrl: './blog-sidebar.component.html',
    styleUrl: './blog-sidebar.component.scss'
})
export class BlogSidebarComponentCopy implements OnInit {
  blogData = BlogData;
  missions: Mission[] = [];
  errorMessage: string = '';
  location: string = ''; // The filter location
  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    if (this.location) {
      // If location is set, fetch missions filtered by location
      this.missionService.getMissionsByLocation(this.location).subscribe(
        (missions: Mission[]) => {
          this.missions = missions;
        },
        (error) => {
          this.errorMessage = 'Error fetching missions by location';
          console.error(error);
        }
      );
    } else {
      // If no location is set, fetch all missions
      this.missionService.getMissions().subscribe(
        (missions: Mission[]) => {
          this.missions = missions;
        },
        (error) => {
          this.errorMessage = 'Error fetching missions';
          console.error(error);
        }
      );
    }
  }

  onLocationChange(location: string): void {
    this.location = location;
    this.ngOnInit();  // Re-fetch missions based on new location
  }
  
}
