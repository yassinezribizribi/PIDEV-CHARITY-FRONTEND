import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import TeamData from '../../../data/team.json'

@Component({
    selector: 'app-team',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './team.component.html',
    styleUrl: './team.component.scss'
})
export class TeamComponent {
  teamData = TeamData;
}
