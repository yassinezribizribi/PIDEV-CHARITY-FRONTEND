import { Component, OnInit } from '@angular/core';
import { MissionService, ParticipationMissionDTO } from '../../services/mission.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-volunteer-participations',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './volunteer-participations.component.html',
    styleUrls: ['./volunteer-participations.component.scss']
})
export class VolunteerParticipationsComponent implements OnInit {
    participations: ParticipationMissionDTO[] = [];
    loading = true;
    searchTerm = '';
    statusFilter = 'ALL';

    constructor(
        private missionService: MissionService,
        private toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadParticipations();
    }

    loadParticipations(): void {
        this.loading = true;
        this.missionService.getMyMissionParticipations().subscribe({
            next: (data) => {
                this.participations = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading participations:', error);
                this.toastr.error('Failed to load your participations');
                this.loading = false;
            }
        });
    }

    cancelParticipation(participationId: number): void {
        if (confirm('Are you sure you want to cancel this participation?')) {
            this.missionService.cancelParticipation(participationId).subscribe({
                next: () => {
                    this.toastr.success('Participation cancelled successfully');
                    this.loadParticipations();
                },
                error: (error) => {
                    console.error('Error cancelling participation:', error);
                    this.toastr.error('Failed to cancel participation');
                }
            });
        }
    }

    getFilteredParticipations(): ParticipationMissionDTO[] {
        return this.participations.filter(participation => {
            const matchesSearch = !this.searchTerm || 
                participation.missionTitle.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                participation.location.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchesStatus = this.statusFilter === 'ALL' || 
                participation.status === this.statusFilter;
            return matchesSearch && matchesStatus;
        });
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'PENDING':
                return 'bg-warning';
            case 'APPROVED':
                return 'bg-success';
            case 'REJECTED':
                return 'bg-danger';
            case 'CANCELLED':
                return 'bg-secondary';
            default:
                return 'bg-info';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'PENDING':
                return 'bi-clock';
            case 'APPROVED':
                return 'bi-check-circle';
            case 'REJECTED':
                return 'bi-x-circle';
            case 'CANCELLED':
                return 'bi-dash-circle';
            default:
                return 'bi-info-circle';
        }
    }

    canCancelParticipation(status: string): boolean {
        return status === 'PENDING' || status === 'APPROVED';
    }
}
