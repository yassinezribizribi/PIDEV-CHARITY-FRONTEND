import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { MissionService } from '../../services/mission.service';
import { Mission } from '../../interfaces/mission.interface';  // Assuming you have a Mission interface
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { CountUpModule } from 'ngx-countup';

@Component({
    selector: 'app-blog-detail-copy',
    standalone: true,

    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        BlogSidebarsComponent,
        CountUpModule,
        ScrollToTopComponent
    ],
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponentCopy implements OnInit {

    mission: Mission | null = null;
    idMission!: number;

    constructor(
        private route: ActivatedRoute,
        private missionService: MissionService,
    ) {}

    ngOnInit(): void {
        // Get the mission ID from the URL
        this.idMission = Number(this.route.snapshot.paramMap.get('id'));
        if (!isNaN(this.idMission)) {
            this.getMissionDetails();  // Fetch mission details if ID is valid
        } else {
            console.error('Invalid mission ID');
        }

        // Optionally, you can subscribe to route params if you want to handle dynamic route changes
        this.route.paramMap.subscribe(params => {
            const id = params.get('idMission');
            console.log('Mission ID from URL:', id);  // Log the ID for debugging
            if (id) {
                this.idMission = +id; // Convert to number
            }
        });
    }

    // Method to get mission details by ID
    getMissionDetails(): void {
        this.missionService.getMissionById(this.idMission).subscribe(
            (data) => {
                this.mission = data;  // Store the fetched mission details
            },
            (error) => {
                console.error('Error fetching mission details:', error);  // Log errors for debugging
            }
        );
    }
}
