import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import TeamData from '../../../data/team.json'
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';

@Component({
    selector: 'app-team',
    imports: [
        CommonModule,
        RouterLink,
        NavbarComponent,
        FooterComponent,
        ScrollToTopComponent
    ],
    templateUrl: './team.component.html',
    styleUrl: './team.component.scss'
})
export class TeamComponent {
  teamData = TeamData;
}
