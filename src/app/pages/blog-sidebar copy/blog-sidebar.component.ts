import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import BlogData from '../../../data/blog.json'
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { MissionService } from '../../services/mission.service';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    location: string = '';
    missionImages: { [key: number]: SafeUrl | null } = {};
    defaultMissionImage = '/assets/images/default-mission.jpg';

    constructor(
        private missionService: MissionService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.loadMissions();
    }

    loadMissions(): void {
        if (this.location) {
            this.missionService.getMissionsByLocation(this.location).subscribe(
                (missions: Mission[]) => {
                    this.missions = missions;
                    this.loadMissionImages(missions);
                },
                (error) => {
                    this.errorMessage = 'Error fetching missions by location';
                    console.error(error);
                }
            );
        } else {
            this.missionService.getMissions().subscribe(
                (missions: Mission[]) => {
                    this.missions = missions;
                    this.loadMissionImages(missions);
                },
                (error) => {
                    this.errorMessage = 'Error fetching missions';
                    console.error(error);
                }
            );
        }
    }

    loadMissionImages(missions: Mission[]): void {
        missions.forEach(mission => {
            const missionId = mission.idMission;
            if (mission.missionLogoPath && missionId) {
                this.missionService.getMissionLogo(mission.missionLogoPath).subscribe({
                    next: (blob: Blob) => {
                        const objectUrl = URL.createObjectURL(blob);
                        this.missionImages[missionId] = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
                    },
                    error: (error) => {
                        console.error('Error loading mission image:', error);
                        if (missionId) {
                            this.missionImages[missionId] = null;
                        }
                    }
                });
            }
        });
    }

    onLocationChange(location: string): void {
        this.location = location;
        this.loadMissions();
    }

    getMissionImage(mission: Mission): SafeUrl | string {
        return mission.idMission && this.missionImages[mission.idMission] 
            ? this.missionImages[mission.idMission]! 
            : this.defaultMissionImage;
    }
}
