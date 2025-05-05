import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { ScrollToTopComponent } from '../../components/scroll-to-top/scroll-to-top.component';
import { MissionService } from '../../services/mission.service';
import { Mission, MissionStatus } from '../../interfaces/mission.interface';
import { MissionRole } from '../../interfaces/mission-role.interface';
import { BlogSidebarsComponent } from '../../components/blog-sidebars/blog-sidebars.component';
import { CountUpModule } from 'ngx-countup';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SubscriberService, Subscriber } from '../../services/subscriber.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-blog-detail',
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
    loading = true;
    error: string | null = null;
    showCvModal = false;
    selectedRole: MissionRole | null = null;
    cvFile: File | null = null;
    isUserValidated = false;
    hasAppliedToRole: { [key: number]: boolean } = {};
    hasAppliedToMission: { [key: number]: boolean } = {};
    validationStatus: 'VALIDATED' | 'NOT_VALIDATED' | 'PENDING_VALIDATION' = 'NOT_VALIDATED';
    missionImageUrl: SafeUrl | null = null;
    defaultMissionImage = '/assets/images/default-mission.jpg';

    constructor(
        private route: ActivatedRoute,
        private missionService: MissionService,
        private modalService: NgbModal,
        private subscriberService: SubscriberService,
        private toastr: ToastrService,
        private sanitizer: DomSanitizer
    ) {}

    ngOnInit(): void {
        this.idMission = Number(this.route.snapshot.paramMap.get('id'));
        if (!isNaN(this.idMission)) {
            this.getMissionDetails();
            this.loadValidationStatus();
        } else {
            this.error = 'Invalid mission ID';
            this.loading = false;
        }

        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.idMission = +id;
                this.getMissionDetails();
            }
        });
    }

    loadValidationStatus(): void {
        this.subscriberService.getCurrentSubscriber().subscribe({
            next: (subscriber: Subscriber) => {
                console.log('Received subscriber status:', subscriber.validationStatus);
                this.validationStatus = subscriber.validationStatus;
                this.isUserValidated = subscriber.validationStatus === 'VALIDATED';
            },
            error: (err: Error) => {
                console.error('Error fetching subscriber info', err);
                this.isUserValidated = false;
            }
        });
    }

    getMissionDetails(): void {
        this.loading = true;
        this.error = null;
        this.missionService.getMissionById(this.idMission).subscribe({
            next: (data) => {
                this.mission = data;
                this.loadMissionImage(data);
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Failed to load mission details';
                this.loading = false;
                console.error('Error fetching mission details:', error);
            }
        });
    }

    loadMissionImage(mission: Mission): void {
        if (mission.missionLogoPath) {
            this.missionService.getMissionLogo(mission.missionLogoPath).subscribe({
                next: (blob: Blob) => {
                    const objectUrl = URL.createObjectURL(blob);
                    this.missionImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
                },
                error: (error) => {
                    console.error('Error loading mission image:', error);
                    this.missionImageUrl = null;
                }
            });
        } else {
            this.missionImageUrl = null;
        }
    }

    onImageError(): void {
        this.missionImageUrl = null;
    }

    getStatusBadgeClass(status?: MissionStatus): string {
        switch(status) {
            case MissionStatus.UPCOMING: return 'bg-primary';
            case MissionStatus.UPGOING: return 'bg-warning';
            case MissionStatus.COMPLETED: return 'bg-success';
            default: return 'bg-secondary';
        }
    }

    getRoleProgress(role: MissionRole): number {
        return (role.numberAccepted / role.numberNeeded) * 100;
    }

    getRoleStatusClass(role: MissionRole): string {
        if (this.hasAppliedToRole[role.idMissionRole]) {
            return 'role-applied';
        }
        if (role.requiresValidation) {
            return 'role-requires-validation';
        }
        return 'role-no-validation';
    }

    canApplyToRole(role: MissionRole): boolean {
        return this.getRoleDisabledReason(role) === null;
    }

    getRoleDisabledReason(role: MissionRole): string | null {
        if (!role || !this.mission) return 'Invalid role or mission';

        const now = new Date();
        const startDate = new Date(this.mission.startDate);
        const endDate = new Date(this.mission.endDate);

        if (role.numberAccepted >= role.numberNeeded) {
            return 'This role is already full';
        }

        if (now > endDate) {
            return 'The mission has already ended';
        }

        if (now > startDate) {
            return 'The mission has already started';
        }

        if (this.hasAppliedToRole[role.idMissionRole]) {
            return 'You have already applied to this role';
        }

        if (this.mission?.idMission && this.hasAppliedToMission[this.mission.idMission]) {
            return 'You have already applied to another role in this mission';
        }

        return null;
    }

    applyToRole(role: MissionRole, content: any): void {
        if (!this.canApplyToRole(role)) {
            return;
        }

        this.selectedRole = role;
        
        // Debug logging
        console.log('Current validation status:', this.validationStatus);
        console.log('Role requires validation:', role.requiresValidation);
        
        // Normalize validation status
        const status = (this.validationStatus || '').trim().toUpperCase();

        // ✅ VALIDATED: Apply directly
        if (status === 'VALIDATED') {
            this.submitApplication(role.idMissionRole);
            return;
        }

        // ✅ PENDING_VALIDATION: Apply directly
        if (status === 'PENDING_VALIDATION') {
            this.submitApplication(role.idMissionRole);
            return;
        }

        // ✅ NOT_VALIDATED + Role Requires Validation → Ask for CV
        if (status === 'NOT_VALIDATED' && role.requiresValidation) {
            this.modalService.open(content, { centered: true });
            return;
        }

        // ✅ NOT_VALIDATED + Role does NOT require validation → Apply directly
        if (!role.requiresValidation) {
            this.submitApplication(role.idMissionRole);
            return;
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                this.toastr.error('Please upload a PDF or Word document');
                event.target.value = ''; // Clear the file input
                this.cvFile = null;
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                this.toastr.error('File size should not exceed 5MB');
                event.target.value = ''; // Clear the file input
                this.cvFile = null;
                return;
            }

            this.cvFile = file;
            this.toastr.success('File selected successfully');
        }
    }

    submitApplication(roleId: number): void {
        if (!roleId || roleId <= 0) {
            console.error('Invalid role ID. Application not submitted.');
            return;
        }

        if (this.cvFile && this.selectedRole?.requiresValidation && this.validationStatus === 'NOT_VALIDATED') {
            // Case 1: Upload CV first, then create participation
            this.missionService.uploadCV(this.cvFile).subscribe({
                next: (response: string) => {
                    console.log('CV uploaded successfully:', response);
                    this.createParticipation(roleId);
                },
                error: (error: any) => {
                    console.error('Error uploading CV:', error);
                    this.toastr.error('Failed to upload CV. Please try again.');
                }
            });
        } else {
            // Cases 2, 3, and 4: Directly create participation
            this.createParticipation(roleId);
        }
    }

    private createParticipation(roleId: number): void {
        this.missionService.applyToMissionRole(roleId).subscribe({
            next: (response: any) => {
                this.toastr.success(response.message || '✅ Application submitted successfully');
                this.hasAppliedToRole[roleId] = true;
                if (this.mission?.idMission) {
                    this.hasAppliedToMission[this.mission.idMission] = true;
                }
                this.getMissionDetails();
            },
            error: (error: any) => {
                console.error('Error submitting application:', error);
                const backendMessage = error.error?.message || '❌ Something went wrong.';
                this.toastr.error(backendMessage);
            }
        });
    }

    isMissionStartedOrEnded(): boolean {
        if (!this.mission) return false;
        
        const now = new Date();
        const startDate = new Date(this.mission.startDate);
        const endDate = new Date(this.mission.endDate);
        
        return now > startDate || now > endDate;
    }

    hasAppliedToCurrentMission(): boolean {
        return this.mission?.idMission ? this.hasAppliedToMission[this.mission.idMission] : false;
    }
}