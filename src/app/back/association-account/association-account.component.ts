import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AssociationService } from '../../services/association.service';
import { AidService } from '../../services/aid.service';
import { EventService } from '../../services/event.service';
import { ModalService } from '../../services/modal.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { ModalComponent } from '../../components/modal/modal.component';
import { Association, AssociationStatus, PartnershipTier, PartnershipImpactReport } from '../../interfaces/association.interface';
import { TndPipe } from '../../shared/pipes/tnd.pipe';
import { AdminNavbarComponent } from '../admin/admin-navbar/admin-navbar.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Donation, DonationStatus } from 'src/app/interfaces/donation.interface';
import { Mission, MissionStatus } from 'src/app/interfaces/mission.interface';
import { AssociationDonationService } from '../../services/association-donation.service';
import { MissionService } from '../../services/mission.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TruncatePipe } from 'src/app/pipes/truncate.pipe';
import { SecurityContext } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConfettiService } from '../../services/confetti.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as bootstrap from 'bootstrap';
import { tap } from 'rxjs/operators';
import confetti from 'canvas-confetti';
import { CelebrationModalComponent } from '../../components/celebration-modal/celebration-modal.component';
import { NgForm } from '@angular/forms';
import { Modal } from 'bootstrap';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Add to interfaces section
interface DonationExtensionSuggestion {
  suggestedDays: number;
  message: string;
  donationProgress: number;
  cagnotteProgress: number;
  donationDailyAvg: number;
  cagnotteDailyAvg: number;
  donationRemaining: number;
  cagnotteRemaining: number;
  donationEstimatedDays: number;
  cagnotteEstimatedDays: number;
}

interface PartnerAssociation extends Association {
  partnershipId?: number;
}

// Add these type definitions before the component class
type TierLevel = 'BRONZE' | 'SILVER' | 'GOLD';

interface Activity {
  id: string;
  type: 'donation' | 'case' | 'event' | 'member' | 'mission';
  title: string;
  description: string;
  date: Date;
  showDetails?: boolean;
  donationDetails?: any;
  missionDetails?: any;
}

interface DonationStatusInfo {
  status: 'complete' | 'no_progress' | 'low_engagement' | 'on_track' | 'slow_progress';
  message: string;
  badge: string;
  badgeClass: string;
}

@Component({
  selector: 'app-association-account',
  standalone: true,
  imports: [
    CommonModule,
    TimeAgoPipe,
    ModalComponent,
    TndPipe,
    AdminNavbarComponent,
    RouterLink,
    NgbTooltip,
    FormsModule,
    TruncatePipe,
    MatIconModule,
    CelebrationModalComponent
  ],
  templateUrl: './association-account.component.html',
  styleUrls: ['./association-account.component.scss']
})
export class AssociationAccountComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm;
  @ViewChild('fileInput') fileInput!: any;
  
  AssociationStatus = AssociationStatus;
  association: Association | null = null;
  loading = true;
  error: string | null = null;
  imageUrl: SafeUrl | null = null;
  donations: Donation[] = [];
  missions: Mission[] = [];
  partners: PartnerAssociation[] = [];
  partnershipError: string | null = null;
  partnershipSuccess: string | null = null;
  partnershipTier?: PartnershipTier;
  impactReport?: PartnershipImpactReport;
  recommendedPartners: any[] = [];
  isCreatingPartnership = false;
  
  partnerLogos: { [id: number]: SafeUrl } = {};
  potentialPartnerLogos: { [id: number]: SafeUrl } = {};
  logoLoadingStates: { [id: number]: boolean } = {};
  defaultLogo = '/assets/images/default-logo.jpg';

  statistics = [
    { 
      key: 'totalDonations', 
      value: 0, 
      label: 'Donations', 
      iconClass: 'uil uil-donate',
      bgClass: 'bg-primary bg-opacity-10 text-primary' 
    },
    { 
      key: 'totalMissions', 
      value: 0, 
      label: 'Missions', 
      iconClass: 'uil uil-rocket',
      bgClass: 'bg-success bg-opacity-10 text-success' 
    },
    { 
      key: 'totalPartners', 
      value: 0, 
      label: 'Partners', 
      iconClass: 'uil uil-handshake',
      bgClass: 'bg-warning bg-opacity-10 text-warning' 
    },
    { 
      key: 'partnershipScore', 
      value: 0, 
      label: 'P-Score', 
      iconClass: 'uil uil-star',
      bgClass: 'bg-info bg-opacity-10 text-info' 
    }
  ];
 
 // In component class
metrics: {
  key: 'jointMissionsCompleted' | 'volunteersShared' | 'efficiencyImprovement' | 'partnershipScore';
  label: string;
  icon: string;
  color: string;
  suffix: string;
}[] = [
  { 
    key: 'jointMissionsCompleted',
    label: 'Joint Missions',
    icon: 'uil uil-rocket',
    color: 'primary',
    suffix: ''
  },
  { 
    key: 'volunteersShared',
    label: 'Shared Volunteers',
    icon: 'uil uil-users-alt',
    color: 'success',
    suffix: ''
  },
  { 
    key: 'efficiencyImprovement',
    label: 'Efficiency Gain',
    icon: 'uil uil-chart-up',
    color: 'warning',
    suffix: '%'
  },
  { 
    key: 'partnershipScore',
    label: 'Partnership Score',
    icon: 'uil uil-star',
    color: 'info',
    suffix: ''
  }
];
  // Activities
  activityFilters = ["all", "donations", "missions"];
  recentActivities: Activity[] = [];
  filterKey: string = "all";
  activitySearchTerm: string = '';

  // Add to component class
extensionSuggestions: { [donationId: number]: DonationExtensionSuggestion } = {};
extensionLoadingStates: { [donationId: number]: boolean } = {};
extensionSuccessMessages: { [donationId: number]: string } = {};

  // Add these properties to the component class after the existing properties
  showFireworks = false;
  autoUpgradeInProgress = false;

  private activeModals: string[] = [];

  selectedPartnerId: number = 0;

  tierInfo!: PartnershipTier & {
    benefits?: string[];
    canUpgrade?: boolean;
  };

  defaultTierBenefits = [
    'Create Joint Missions',
    'Basic Partnership Features',
    'Up to 3 Partners'
  ];

  // Add this property to track the highest achieved tier
  private highestAchievedTier: string = 'BRONZE';

  jointMissions: Mission[] = [];
  jointMissionMetrics: {
    totalJointMissions: number;
    completedJointMissions: number;
    activeJointMissions: number;
    totalPartnersCollaborated: number;
    totalVolunteersEngaged: number;
    impactScore: number;
  } = {
    totalJointMissions: 0,
    completedJointMissions: 0,
    activeJointMissions: 0,
    totalPartnersCollaborated: 0,
    totalVolunteersEngaged: 0,
    impactScore: 0
  };

  // Update the tier properties with proper types
  tierBenefits: Record<TierLevel, string[]> = {
    'BRONZE': [
      'Up to 3 partner associations',
      'Basic collaboration tools',
      'Monthly partnership reports',
      'Joint mission basics'
    ],
    'SILVER': [
      'Up to 5 partner associations',
      'Enhanced collaboration tools',
      'Partnership analytics',
      'Joint mission support',
      'Advanced reporting'
    ],
    'GOLD': [
      'Up to 10 partner associations',
      'Advanced collaboration tools',
      'Priority partnership matching',
      'Custom partnership analytics',
      'Joint mission coordination',
      'Unlimited joint missions'
    ]
  };

  tierIcons: Record<TierLevel, string> = {
    'BRONZE': 'uil uil-award text-bronze fs-1',
    'SILVER': 'uil uil-award text-silver fs-1',
    'GOLD': 'uil uil-award text-gold fs-1'
  };

  // Add these properties
  editAssociationData: {
    associationName: string;
    description: string;
    associationAddress: string;
  } = {
    associationName: '',
    description: '',
    associationAddress: ''
  };
  private editModal: Modal | null = null;

  // Add these properties at the class level
  private toastr: ToastrService;

  activities: Activity[] = [];
  selectedActivity: Activity | null = null;
  showActivityDetails = false;

  missionImageUrl: SafeUrl | null = null;
  defaultMissionImage = '/assets/images/default-logo.jpg';

  constructor(
    private missionService: MissionService,
    private associationDonationService: AssociationDonationService,
    private authService: AuthService,
    private associationService: AssociationService,
    private aidService: AidService,
    private eventService: EventService,
    private modalService: ModalService,
    private router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    toastr: ToastrService,
    private modal: NgbModal,
    private confettiService: ConfettiService,
    private formBuilder: FormBuilder
  ) {
    this.toastr = toastr;
  }

  ngOnInit() {
    // Restore highest achieved tier from localStorage
    const savedTier = localStorage.getItem('highestAchievedTier');
    if (savedTier) {
      this.highestAchievedTier = savedTier;
    }
    this.initializeComponent();
  }

  private initializeComponent() {
    this.loadAssociation();
    this.loadDonations();
    this.loadMissions();
    this.loadJointMissions();
    this.loadPartnershipTier();
    this.sortActivities();
  }

  // ============== LOADING METHODS ==============
  private loadAssociation() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'User not authenticated';
      this.loading = false;
      return;
    }

    this.associationService.getAssociationByUserId(userId.toString()).subscribe({
      next: (association) => {
        this.association = association;
        this.updateStatistics();
        this.loading = false;
        this.loadImpactReport();
        this.loadPartnershipTier();

        if (this.association?.associationLogoPath) {
          this.loadImage(this.association.associationLogoPath);
        }

        this.loadPartners();
      },
      error: (err) => {
        console.error('Association load error:', err);
        this.error = 'Failed to load association details';
        this.loading = false;
      }
    });
  }

  async loadPartnershipTier() {
    if (!this.association?.idAssociation) return;
    
    try {
      // Get fresh association data
      const freshAssociation = await this.associationService.getAssociationById(this.association.idAssociation).toPromise();
      if (freshAssociation) {
        this.association = freshAssociation;
      }

      // Get stored highest tier
      const storedHighestTier = localStorage.getItem('highestAchievedTier') || 'BRONZE';
      this.highestAchievedTier = storedHighestTier;

      // Then get partnership tier data
      const tierResponse = await this.associationService.getPartnershipTier(this.association.idAssociation).toPromise();

      if (tierResponse) {
        // Determine the effective tier - never go lower than highest achieved
        const backendTier = tierResponse.currentTier || 'BRONZE';
        const backendTierRank = this.getTierRank(backendTier);
        const highestTierRank = this.getTierRank(this.highestAchievedTier);
        
        // Use the higher of the two tiers
        const effectiveTier = backendTierRank >= highestTierRank ? backendTier : this.highestAchievedTier;
        
        // Update the association's tier
        this.association.partnershipTier = effectiveTier;
        
        // Update highest achieved tier if backend tier is higher
        if (backendTierRank > highestTierRank) {
          this.highestAchievedTier = backendTier;
          localStorage.setItem('highestAchievedTier', backendTier);
        }

        // Set partnership tier info using the effective tier
        this.partnershipTier = {
          tier: effectiveTier,
          maxPartners: this.getPartnerMaxLimit(effectiveTier),
          benefits: this.tierBenefits[effectiveTier as TierLevel],
          nextThreshold: effectiveTier === 'GOLD' ? 100 : (effectiveTier === 'SILVER' ? 61 : 31),
          score: tierResponse.score || 0
        };

        // Store current state
        localStorage.setItem('partnershipTier', JSON.stringify(this.partnershipTier));
        
        // Update statistics
        this.updateStatistics();

        // Log tier state for debugging
        console.log('Tier State:', {
          backendTier,
          highestAchievedTier: this.highestAchievedTier,
          effectiveTier,
          storedHighestTier,
          partnerCount: this.partners?.length
        });
      }
    } catch (error) {
      console.error('Failed to load partnership tier:', error);
      this.toastr.error('Failed to load partnership tier data');
    }
  }
  

  // Update getTierInfo to respect partner count
  private getTierInfo(tier: string = 'BRONZE'): { 
    maxPartners: number, 
    nextThreshold: number,
    canUpgrade: boolean,
    nextTier: string | null,
    benefits: string[],
    color: string,
    score: number,
    name: string,
    icon: string
  } {
    // Check current partner count
    const currentPartnerCount = this.partners?.length || 0;
    
    // If no partners, force BRONZE tier
    if (currentPartnerCount === 0) {
      return { 
        maxPartners: 3, 
        nextThreshold: 31,
        canUpgrade: true,
        nextTier: 'SILVER',
        benefits: [
          'Up to 3 partner associations',
          'Basic collaboration tools',
          'Monthly partnership reports',
          'Joint mission basics'
        ],
        color: 'bronze',
        score: 0,
        name: 'BRONZE',
        icon: this.tierIcons['BRONZE']
      };
    }

    // Otherwise use the provided tier
    const normalizedTier = tier.toUpperCase() as TierLevel;
    switch(normalizedTier) {
      case 'GOLD':
        return { 
          maxPartners: 10, 
          nextThreshold: 100,
          canUpgrade: false,
          nextTier: null,
          benefits: this.tierBenefits['GOLD'],
          color: 'gold',
          score: 100,
          name: 'GOLD',
          icon: this.tierIcons['GOLD']
        };
      case 'SILVER':
        return { 
          maxPartners: 5, 
          nextThreshold: 61,
          canUpgrade: true,
          nextTier: 'GOLD',
          benefits: this.tierBenefits['SILVER'],
          color: 'silver',
          score: 61,
          name: 'SILVER',
          icon: this.tierIcons['SILVER']
        };
      default: // BRONZE
        return { 
          maxPartners: 3, 
          nextThreshold: 31,
          canUpgrade: true,
          nextTier: 'SILVER',
          benefits: this.tierBenefits['BRONZE'],
          color: 'bronze',
          score: 31,
          name: 'BRONZE',
          icon: this.tierIcons['BRONZE']
        };
    }
  }

  private async performTierUpgrade(nextTier: string) {
    if (!this.association?.idAssociation) return;
    
    this.loading = true;
    await this.closeAllModals();
    
    try {
      const upgradeResponse = await this.associationService.upgradeTier(
        this.association.idAssociation,
        nextTier
      ).toPromise();

      if (upgradeResponse?.newTier) {
        this.association.partnershipTier = upgradeResponse.newTier;
        this.highestAchievedTier = upgradeResponse.newTier;
        localStorage.setItem('highestAchievedTier', upgradeResponse.newTier);
      }

      // Wait for backend to process
      await new Promise(resolve => setTimeout(resolve, 1500));
      await this.forceRefreshAllData();

      // Show success messages
      this.confettiService.triggerTierUpgrade();
      this.toastr.success(`Successfully upgraded to ${nextTier} tier!`);
      
      // Ensure proper modal cleanup before showing celebration
      await this.closeAllModals();
      await new Promise(resolve => setTimeout(resolve, 300));
      await this.showCelebrationModal(nextTier);
      
      return upgradeResponse;
    } catch (error) {
      this.handleUpgradeError(error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  private async forceRefreshAllData() {
    if (!this.association?.idAssociation) return;

    try {
      // Get fresh association data
      const freshAssociation = await this.associationService.getAssociationById(this.association.idAssociation).toPromise();
      if (freshAssociation) {
        this.association = freshAssociation;
      }

      // Get fresh tier data
      await this.loadPartnershipTier();

      // Refresh partners and recommendations
      await Promise.all([
        this.loadPartners(),
        this.loadRecommendedPartners()
      ]);

      // Update statistics
      this.updateStatistics();
    } catch (error) {
      console.error('Error refreshing data:', error);
      this.toastr.warning('Some data may not be up to date. Please refresh the page.');
    }
  }

  async createPartnership(partnerId: number) {
    if (!this.association?.idAssociation) return;

    try {
      // Get fresh data before proceeding
      await this.forceRefreshAllData();

      const currentPartnerCount = this.partners?.length || 0;
      const currentTier = this.association.partnershipTier || this.highestAchievedTier;
      const maxAllowed = this.getPartnerMaxLimit(currentTier);

      // Check if we've reached the limit for current tier
      if (currentPartnerCount >= maxAllowed) {
        // Show upgrade modal instead of auto-upgrading
        this.partnershipError = `You've reached the maximum partnerships (${maxAllowed}) for ${currentTier} tier. Please upgrade to add more partners.`;
        this.showTierUpgradeModal();
        return;
      }

      const partner = this.recommendedPartners.find(p => p.idAssociation === partnerId);
      if (!partner) {
        this.partnershipError = 'Partner not found';
        return;
      }

      this.clearMessages();
      this.isCreatingPartnership = true;

      // Create partnership without tier manipulation
      const response = await this.associationService.createPartnership(
        this.association.idAssociation, 
        partnerId
      ).toPromise();

      if (response) {
        await this.forceRefreshAllData();
        this.toastr.success('Partnership created successfully');
        this.recommendedPartners = this.recommendedPartners.filter(p => p.idAssociation !== partnerId);
      }
    } catch (error) {
      this.toastr.error('Failed to create partnership. Please try again.');
      this.partnershipError = 'Unable to create partnership at this time. Please try again later.';
    } finally {
      this.isCreatingPartnership = false;
    }
  }

  // Helper method to rank tiers
  private getTierRank(tier: string): number {
    const ranks = {
      'BRONZE': 1,
      'SILVER': 2,
      'GOLD': 3
    };
    return ranks[tier.toUpperCase() as keyof typeof ranks] || 0;
  }

  get currentTierDisplay(): string {
    return this.association?.partnershipTier?.toUpperCase() || 'BRONZE';
  }

  get maxPartnerships(): number {
    return this.getPartnerMaxLimit(this.currentTierDisplay as TierLevel);
  }

  getSimilarityBadgeClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    return 'fair';
  }
  getActivityBadgeClass(type: string): string {
    return {
      'donation': 'bg-primary',
      'mission': 'bg-success',
      'event': 'bg-warning',
      'member': 'bg-danger'
    }[type] || 'bg-secondary';
  }
 
 // In AssociationAccountComponent class
isPendingStatus(status: AssociationStatus | undefined): boolean {
  return status === AssociationStatus.PENDING;
}
loadImpactReport() {
  if (!this.association?.idAssociation) return;

  this.associationService.generateImpactReport(this.association.idAssociation).subscribe({
    next: (report) => {
      this.impactReport = report;
    },
    error: (err) => console.error('Failed to load impact report:', err)
  });
}

  private loadPartners() {
    if (!this.association?.idAssociation) return;
  
    this.associationService.getPartners(this.association.idAssociation).subscribe({
      next: (partners) => {
        this.partners = partners || [];
        this.loadPartnerLogos();
        this.loadRecommendedPartners();
        this.updateStatistics();
      },
      error: (err) => {
        console.error('Failed to load partners:', err);
        this.partnershipError = err.error?.message || 'Failed to load current partners';
        this.partners = [];
        this.loadRecommendedPartners();
      }
    });
  }

  private loadRecommendedPartners() {
    if (!this.association?.idAssociation) return;
  
    this.associationService.getRecommendedPartners(this.association.idAssociation).subscribe({
      next: (partners) => {
        this.recommendedPartners = partners.map(p => ({
          ...p,
          similarityScore: this.calculateInitialSimilarityScore(p)
        }));

        // Load logos for recommended partners
        this.loadRecommendedPartnerLogos();
      },
      error: (err) => {
        console.error('Failed to load recommended partners:', err);
        this.partnershipError = 'Failed to load partner recommendations';
        this.recommendedPartners = [];
      }
    });
  }

  private calculateInitialSimilarityScore(partner: Association): number {
    if (!this.association || !partner) return 0;

    let score = 0;
    const weights = {
      missionAlignment: 0.3,
      locationProximity: 0.2,
      partnershipScore: 0.2,
      activityOverlap: 0.15,
      tagSimilarity: 0.15
    };

    // Mission alignment (based on description similarity)
    const associationDesc = this.association.description || '';
    const partnerDesc = partner.description || '';
    if (associationDesc && partnerDesc) {
      const commonWords = this.getCommonWords(
        associationDesc.toLowerCase(),
        partnerDesc.toLowerCase()
      );
      score += (commonWords * weights.missionAlignment);
    }

    // Location proximity
    if (this.association.associationAddress && partner.associationAddress) {
      const sameCity = this.association.associationAddress.toLowerCase()
        .includes(partner.associationAddress.toLowerCase()) ||
        partner.associationAddress.toLowerCase()
        .includes(this.association.associationAddress.toLowerCase());
      if (sameCity) score += weights.locationProximity;
    }

    // Partnership score comparison
    const scoreDiff = Math.abs((this.association.partnershipScore || 0) - (partner.partnershipScore || 0));
    score += weights.partnershipScore * (1 - scoreDiff / 100);

    // Activity overlap (based on missions and donations)
    const activityOverlap = this.calculateActivityOverlap(partner);
    score += activityOverlap * weights.activityOverlap;

    // Tag similarity
    const tagSimilarity = this.calculateTagSimilarity(partner);
    score += tagSimilarity * weights.tagSimilarity;

    return Math.round(score * 100);
  }

  private calculateTagSimilarity(partner: Association): number {
    if (!this.association?.tags || !partner.tags || 
        this.association.tags.length === 0 || partner.tags.length === 0) {
      return 0;
    }

    const associationTags = new Set(this.association.tags.map((tag: string) => tag.toLowerCase()));
    const partnerTags = new Set(partner.tags.map((tag: string) => tag.toLowerCase()));

    // Calculate Jaccard similarity coefficient
    const intersection = new Set([...associationTags].filter(x => partnerTags.has(x)));
    const union = new Set([...associationTags, ...partnerTags]);

    return intersection.size / union.size;
  }

  private calculateActivityOverlap(partner: Association): number {
    let overlap = 0;
    
    // Compare number of missions
    const missionDiff = Math.abs((this.missions?.length || 0) - (partner.missions?.length || 0));
    const maxMissions = Math.max((this.missions?.length || 0), (partner.missions?.length || 0)) || 1;
    overlap += 0.5 * (1 - missionDiff / maxMissions);
    
    // Compare number of donations
    const donationDiff = Math.abs((this.donations?.length || 0) - (partner.donations?.length || 0));
    const maxDonations = Math.max((this.donations?.length || 0), (partner.donations?.length || 0)) || 1;
    overlap += 0.5 * (1 - donationDiff / maxDonations);
    
    return overlap;
  }

  private getCommonWords(text1: string, text2: string): number {
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  // Add these methods to your AssociationAccountComponent class

  getTierClass(): string {
    const tier = this.currentTierDisplay;
    return {
      'BRONZE': 'bronze-tier',
      'SILVER': 'silver-tier',
      'GOLD': 'gold-tier'
    }[tier] || 'bronze-tier';
  }

  formatSimilarityScore(score: number): string {
  return `${Math.round(score)}% Match`;
}

calculateTierProgress(): number {
  if (!this.partnershipTier) return 0;
  const { score, nextThreshold } = this.partnershipTier;
  return (score / nextThreshold) * 100;
}

private loadDonations() {
  this.associationDonationService.getDonationsByAssociation().subscribe({
    next: (donations) => {
      console.log('Loaded donations:', donations);
      this.donations = donations;
      this.updateActivities();
    },
    error: (err) => {
      console.error('Error loading donations:', err);
    }
  });
}

private loadMissions() {
  this.missionService.getMissionsByAssociation().subscribe({
    next: (missions) => {
      this.missions = missions;
      this.updateActivities();
    },
    error: (err) => {
      console.error('Error loading missions:', err);
    }
  });
}

  // Add these new methods after the existing loadMissions method
  private loadJointMissions() {
    if (!this.association?.idAssociation) return;

    this.missionService.getMissionsByAssociation().subscribe({
      next: (missions: Mission[]) => {
        this.jointMissions = missions;
        this.loadJointMissionMetrics();
        this.updateActivities();
      },
      error: (error: any) => {
        console.error('Error loading joint missions:', error);
        this.toastr.error('Failed to load joint missions');
      }
    });
  }

  private loadJointMissionMetrics() {
    if (!this.association?.idAssociation) return;

    this.missionService.getMissionsByAssociation().subscribe({
      next: (missions) => {
        this.jointMissionMetrics = {
          totalJointMissions: missions.length,
          completedJointMissions: missions.filter(m => m.status === MissionStatus.COMPLETED).length,
          activeJointMissions: missions.filter(m => m.status === MissionStatus.UPGOING).length,
          totalPartnersCollaborated: this.partners.length,
          totalVolunteersEngaged: missions.reduce((acc, m) => acc + (m.volunteerCount || 0), 0),
          impactScore: this.calculateImpactScore(missions)
        };
        this.updateStatistics();
      },
      error: (error) => {
        console.error('Error loading joint mission metrics:', error);
        this.toastr.error('Failed to load joint mission metrics');
      }
    });
  }

  private calculateImpactScore(missions: Mission[]): number {
    const completedMissions = missions.filter(m => m.status === MissionStatus.COMPLETED).length;
    const totalMissions = missions.length;
    const volunteerEngagement = missions.reduce((acc, m) => acc + (m.volunteerCount || 0), 0);
    
    return Math.round((completedMissions / totalMissions) * 50 + (volunteerEngagement / (totalMissions * 10)) * 50);
  }

  createJointMission(mission: Mission) {
    // Convert string dates to Date objects
    const startDate = new Date(mission.startDate || new Date());
    const endDate = new Date(mission.endDate || new Date());

    this.missionService.createMission(
      mission.title || '',
      mission.description || '',
      mission.location || '',
      startDate,
      endDate,
      mission.status || MissionStatus.UPCOMING,
      undefined,
      mission.missionRoles || []
    ).subscribe({
      next: (createdMission) => {
        this.jointMissions.push(createdMission);
        this.toastr.success('Joint mission created successfully');
        this.loadJointMissionMetrics();
        this.updateActivities();
      },
      error: (error) => {
        console.error('Error creating joint mission:', error);
        this.toastr.error('Failed to create joint mission');
      }
    });
  }

  inviteToJointMission(missionId: number) {
    this.missionService.updateMission(missionId, { 
      status: MissionStatus.UPCOMING,
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      volunteerCount: 0
    } as Mission).subscribe({
      next: (updatedMission) => {
        const index = this.jointMissions.findIndex(m => m.idMission === missionId);
        if (index !== -1) {
          this.jointMissions[index] = updatedMission;
        }
        this.toastr.success('Invitation sent successfully');
      },
      error: (error) => {
        console.error('Error inviting to joint mission:', error);
        this.toastr.error('Failed to send invitation');
      }
    });
  }

  acceptJointMissionInvite(missionId: number) {
    if (!this.association?.idAssociation) return;

    this.missionService.updateMission(missionId, { 
      status: MissionStatus.UPGOING,
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      volunteerCount: 0
    } as Mission).subscribe({
      next: (updatedMission) => {
        this.jointMissions.push(updatedMission);
        this.toastr.success('Joint mission invitation accepted');
        this.loadJointMissionMetrics();
        this.updateActivities();
      },
      error: (error) => {
        console.error('Error accepting joint mission invite:', error);
        this.toastr.error('Failed to accept invitation');
      }
    });
  }

  leaveJointMission(missionId: number) {
    if (!this.association?.idAssociation) return;

    this.missionService.updateMission(missionId, { 
      status: MissionStatus.COMPLETED,
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      volunteerCount: 0
    } as Mission).subscribe({
      next: () => {
        this.jointMissions = this.jointMissions.filter(m => m.idMission !== missionId);
        this.toastr.success('Left joint mission successfully');
        this.loadJointMissionMetrics();
        this.updateActivities();
      },
      error: (error) => {
        console.error('Error leaving joint mission:', error);
        this.toastr.error('Failed to leave joint mission');
      }
    });
  }

  updateProgress(missionId: number, progress: any) {
    const missionUpdate: Mission = {
      idMission: missionId,
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      endDate: new Date(),
      volunteerCount: 0,
      status: MissionStatus.UPGOING
    };
    
    this.missionService.updateMission(missionId, missionUpdate).subscribe({
      next: (updatedMission) => {
        const index = this.jointMissions.findIndex(m => m.idMission === missionId);
        if (index !== -1) {
          this.jointMissions[index] = updatedMission;
        }
        this.loadJointMissionMetrics();
      },
      error: (error) => {
        console.error('Error updating mission progress:', error);
        this.toastr.error('Failed to update mission progress');
      }
    });
  }

  // ============== LOGO HANDLING ==============
  private loadImage(filename: string): void {
    this.associationService.getAssociationLogo(filename).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => this.imageUrl = null
    });
  }

  // Consolidated logo loading method
  private loadLogo(partner: Association, isPotential: boolean = false): void {
    if (!partner.associationLogoPath || !partner.idAssociation) {
      // Set default logo if no logo path
      const defaultSafeUrl = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
      if (isPotential) {
        this.potentialPartnerLogos[partner.idAssociation || 0] = defaultSafeUrl;
      } else {
        this.partnerLogos[partner.idAssociation || 0] = defaultSafeUrl;
      }
      return;
    }

    this.logoLoadingStates[partner.idAssociation] = true;
    
    this.associationService.getAssociationLogo(partner.associationLogoPath).subscribe({
      next: (blob: Blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        
        if (isPotential) {
          this.potentialPartnerLogos[partner.idAssociation!] = safeUrl;
        } else {
          this.partnerLogos[partner.idAssociation!] = safeUrl;
        }
        this.logoLoadingStates[partner.idAssociation!] = false;
      },
      error: () => {
        const defaultSafeUrl = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
        if (isPotential) {
          this.potentialPartnerLogos[partner.idAssociation!] = defaultSafeUrl;
        } else {
          this.partnerLogos[partner.idAssociation!] = defaultSafeUrl;
        }
        this.logoLoadingStates[partner.idAssociation!] = false;
      }
    });
  }

  // Updated methods to use consolidated logic
  private loadPartnerLogos() {
    this.partners.forEach(partner => this.loadLogo(partner));
  }

  private loadRecommendedPartnerLogos() {
    this.recommendedPartners.forEach(partner => this.loadLogo(partner, true));
  }

  getRecommendedPartnerLogo(partner: Association): SafeUrl {
    if (!partner?.idAssociation) {
      return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    }
    
    // If logo is already loaded, return it
    if (this.potentialPartnerLogos[partner.idAssociation]) {
      return this.potentialPartnerLogos[partner.idAssociation];
    }
    
    // If not loaded yet, trigger load and return default for now
    this.loadLogo(partner, true);
    return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  private handleLogoError(partner: Association) {
    if (partner.idAssociation) {
      this.partnerLogos[partner.idAssociation] = this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    }
  }

  getPartnerLogo(partner: Association): SafeUrl {
    if (!partner?.idAssociation) return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    return this.partnerLogos[partner.idAssociation] || this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  getPotentialPartnerLogo(partner: Association): SafeUrl {
    if (!partner?.idAssociation) return this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
    return this.potentialPartnerLogos[partner.idAssociation] || this.sanitizer.bypassSecurityTrustUrl(this.defaultLogo);
  }

  // ============== DATA UPDATES ==============
  private updateStatistics() {
    if (!this.association) return;

    const tierInfo = this.getTierInfo(this.currentTierDisplay);

    this.statistics = [
      { 
        key: 'totalDonations', 
        value: this.donations.length,
        label: 'Donations', 
        iconClass: 'uil uil-donate',
        bgClass: 'bg-primary bg-opacity-10 text-primary' 
      },
      { 
        key: 'totalMissions', 
        value: (this.missions?.length || 0) + (this.jointMissionMetrics?.totalJointMissions || 0),
        label: 'Missions', 
        iconClass: 'uil uil-rocket',
        bgClass: 'bg-success bg-opacity-10 text-success' 
      },
      { 
        key: 'totalPartners', 
        value: this.partners.length,
        label: `Partners (${this.partners.length}/${tierInfo.maxPartners})`, 
        iconClass: 'uil uil-handshake',
        bgClass: 'bg-warning bg-opacity-10 text-warning' 
      },
      { 
        key: 'partnershipScore', 
        value: this.association?.partnershipScore || 0,
        label: `P-Score (${tierInfo.name})`, 
        iconClass: 'uil uil-star',
        bgClass: 'bg-info bg-opacity-10 text-info' 
      }
    ];
  }

  private updateActivities() {
    const donationActivities: Activity[] = this.donations.map(donation => ({
      id: donation.idDonation?.toString() || '',
      type: 'donation',
      title: donation.titre || 'New Donation',
      description: `Donation of type ${donation.donationType}`,
      date: new Date(donation.endDate),
      donationDetails: donation
    }));

    const missionActivities: Activity[] = this.missions.map(mission => ({
      id: mission.idMission?.toString() || '',
      type: 'mission',
      title: mission.title || 'New Mission',
      description: mission.description || '',
      date: new Date(mission.endDate),
      missionDetails: mission
    }));

    this.recentActivities = [...donationActivities, ...missionActivities];
    this.sortActivities();
  }

  private sortActivities(order: 'newest' | 'oldest' = 'newest') {
    this.recentActivities.sort((a, b) => {
      // Prioritize eligible donations first
      const aEligible = a.type === 'donation' && this.isDonationEligibleForExtension(a.donationDetails);
      const bEligible = b.type === 'donation' && this.isDonationEligibleForExtension(b.donationDetails);

      if (aEligible && !bEligible) return -1;
      if (!aEligible && bEligible) return 1;

      // For eligible donations, sort by end date (earliest first)
      if (aEligible && bEligible) {
        return a.date.getTime() - b.date.getTime();
      }

      // For non-donations, sort by date
      return order === 'newest' 
        ? b.date.getTime() - a.date.getTime()
        : a.date.getTime() - b.date.getTime();
    });
  }

  public isDonationEligibleForExtension(donation: Donation): boolean {
    const endDate = new Date(donation.endDate);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const donationIncomplete = (donation.quantiteDonnee || 0) < (donation.quantiteDemandee || 0);
    const cagnotteIncomplete = donation.cagnotteenligne?.currentAmount !== undefined && 
                              donation.cagnotteenligne?.goalAmount !== undefined &&
                              donation.cagnotteenligne.currentAmount < donation.cagnotteenligne.goalAmount;

    return daysRemaining <= 3 && (donationIncomplete || cagnotteIncomplete);
  }

  getExtensionSuggestion(donationId: number): void {
    if (this.extensionLoadingStates[donationId]) return;

    this.extensionLoadingStates[donationId] = true;
    console.log('Fetching extension suggestion for donation:', donationId);

    this.associationDonationService.suggestExtension(donationId).subscribe({
      next: (suggestion: DonationExtensionSuggestion) => {
        console.log('Received extension suggestion:', suggestion);
        this.extensionSuggestions[donationId] = suggestion;
        this.extensionLoadingStates[donationId] = false;
      },
      error: (error: any) => {
        console.error('Error getting extension suggestion:', error);
        this.extensionLoadingStates[donationId] = false;
      }
    });
  }

  applyExtension(donation: Donation): void {
    if (!donation?.idDonation || !this.extensionSuggestions[donation.idDonation]) {
      return;
    }

    const donationId = donation.idDonation;
    const suggestedDays = this.extensionSuggestions[donationId].suggestedDays;
    this.extensionLoadingStates[donationId] = true;

    this.associationDonationService.prolongDonation(donationId, suggestedDays).subscribe({
      next: (response) => {
        this.extensionLoadingStates[donationId] = false;
        this.dismissExtensionSuggestion(donationId);
        this.toastr.success('Extension applied successfully! The donation period has been extended.', 'Success');
        // Refresh the entire page
        window.location.reload();
      },
      error: (error) => {
        this.extensionLoadingStates[donationId] = false;
        this.toastr.error('Failed to apply extension. Please try again.', 'Error');
        console.error('Error applying extension:', error);
      }
    });
  }

  dismissExtensionSuggestion(donationId: number): void {
    console.log('Dismissing extension suggestion for donation:', donationId);
    delete this.extensionSuggestions[donationId];
    delete this.extensionLoadingStates[donationId];
  }

  // ============== UI ENHANCEMENTS ==============
  get filteredActivities(): Activity[] {
    let activities = this.recentActivities;
    
    // First filter by type if not "all"
    if (this.filterKey !== "all") {
      activities = activities.filter(a => a.type === this.filterKey);
    }
    
    // Then filter by search term if present
    if (this.activitySearchTerm) {
      const term = this.activitySearchTerm.toLowerCase();
      activities = activities.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.description.toLowerCase().includes(term)
      );
    }
    
    // Sort activities: donations first, then missions
    return activities.sort((a, b) => {
      // If both are donations or both are missions, sort by date
      if (a.type === b.type) {
        return b.date.getTime() - a.date.getTime(); // newest first
      }
      // Put donations before missions
      return a.type === 'donation' ? -1 : 1;
    });
  }

  getStatTooltip(statKey: string): string {
    const tooltips: Record<string, string> = {
      totalDonations: 'Total donations received by your association',
      totalMissions: 'Active and completed missions',
      totalPartners: 'Current partnered organizations',
      partnershipScore: 'Your partnership reputation score (0-100)'
    };
    return tooltips[statKey] || '';
  }

  refreshData() {
    this.loading = true;
    this.clearMessages();
    this.initializeComponent();
  }
  toggleActivityDetails(activity: any) {
    if (this.selectedActivity === activity) {
      this.selectedActivity = null;
      this.showActivityDetails = false;
    } else {
      this.selectedActivity = activity;
      this.showActivityDetails = true;
      
      // Fetch extension suggestion when viewing a donation
      if (activity.id_donation) {
        this.getExtensionSuggestion(activity.id_donation);
      }
    }
  }

  getProgressPercentage(donation: Donation | null | undefined): number {
    if (!donation || !donation.quantiteDemandee) return 0;
    return (donation.quantiteDonnee / donation.quantiteDemandee) * 100;
  }

  convertToNumber(id: string | number): number {
    return typeof id === 'string' ? parseInt(id, 10) : id;
  }

  // ============== NAVIGATION METHODS ==============
  onCreateDonation() {
    this.router.navigate(['/association/account/creedoantion']);
  }

  onCreateMission() {
    this.router.navigate(['/association/account/creemission']);
  }

  onCreateAidAnnouncement() {
    this.router.navigate(['/aid/create']);
  }

  onCreateEvent() {
    this.router.navigate(['/events/create']);
  }
  onManageDons() {
    this.router.navigate(['/validate-dons']);
  }

  // ============== ACTIVITY METHODS ==============
  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'donation': 'uil uil-heart-medical',
      'mission': 'uil uil-rocket',
      'event': 'uil uil-calendar-alt',
      'member': 'uil uil-user-plus'
    };
    return icons[type] || 'uil uil-question-circle';
  }  

  setActivityFilter(filterKey: string) {
    if (this.activityFilters.includes(filterKey)) {
      this.filterKey = filterKey;
      // Reset search term when changing filter
      this.activitySearchTerm = '';
    }
  }

  // ============== ASSOCIATION METHODS ==============
  deleteAssociation() {
    if (this.association && this.association.idAssociation !== undefined) {
      if (confirm('Are you sure you want to delete this association? This action cannot be undone.')) {
        this.associationService.deleteAssociation(this.association.idAssociation).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/associations']);
          },
          error: (err) => {
            console.error('Error deleting association:', err);
            this.error = 'Failed to delete association. Please try again.';
          }
        });
      }
    } else {
      console.error('Association ID is undefined');
    }
  }

  // ============== PARTNERSHIP METHODS ==============
 public showTierUpgradeModal() {
    try {
      this.closeAllModals().then(() => {
      if (!this.association?.idAssociation) {
        this.toastr.error('Association information not found. Please refresh the page.');
        return;
      }

        const tierInfo = this.getTierInfo(this.currentTierDisplay);
      
        if (!tierInfo.canUpgrade || (this.partners?.length || 0) < tierInfo.maxPartners) {
        return;
      }

      const modalRef = this.modal.open(CelebrationModalComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        animation: true
      });
      
        const nextTierInfo = this.getTierInfo(tierInfo.nextTier || '');
        
        modalRef.componentInstance.title = `Upgrade to ${tierInfo.name} Tier`;
        modalRef.componentInstance.message = `Unlock new partnership capabilities with ${tierInfo.name} tier!`;
        modalRef.componentInstance.benefits = nextTierInfo.benefits;
      modalRef.componentInstance.showUpgradeButton = true;
      modalRef.componentInstance.upgradeButtonText = 'Upgrade Now';
      
      modalRef.componentInstance.upgradeClicked.subscribe(() => {
          if (tierInfo.nextTier) {
            this.performTierUpgrade(tierInfo.nextTier);
          }
        });
        
        modalRef.result.finally(() => {
          setTimeout(() => this.clearModalBackdrop(), 300);
        });
      });
    } catch (error) {
      this.toastr.error('An error occurred while showing the upgrade modal');
      this.closeAllModals();
    }
  }

  private handleUpgradeError(error: any) {
    let errorMessage = 'Failed to upgrade tier.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 400) {
      errorMessage = 'Invalid upgrade request. Please try again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to upgrade the tier.';
    } else if (error.status === 404) {
      errorMessage = 'Upgrade service is not available. Please try again later.';
    }
    
    this.toastr.error(errorMessage);
  }

  // Getters for tier-related information
  get currentTierInfo() {
    return this.getTierInfo(this.association?.partnershipTier || this.highestAchievedTier);
  }

  get currentTierBenefits(): string[] {
    return this.tierBenefits[this.currentTierDisplay as TierLevel] || this.tierBenefits['BRONZE'];
  }

  get currentTierIcon(): string {
    return this.tierIcons[this.currentTierDisplay as TierLevel] || this.tierIcons['BRONZE'];
  }

  get nextTierName(): string {
    return this.currentTierInfo.nextTier || this.currentTierInfo.name;
  }

  get canShowUpgradeButton(): boolean {
    if (!this.association?.partnershipTier) return false;
    const currentTier = this.currentTierInfo;
    const currentPartners = this.partners?.length || 0;
    return currentTier.canUpgrade && 
           (currentPartners >= currentTier.maxPartners || 
            (this.association.partnershipScore || 0) >= currentTier.nextThreshold);
  }

  get progressBarPercentage(): number {
    const currentPartners = this.partners.length;
    const maxPartners = this.maxPartnerships;
    return (currentPartners / maxPartners) * 100;
  }

  get progressBarClass(): string {
    const percentage = this.progressBarPercentage;
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  }

  get collaborateButtonText(): string {
    const currentCount = this.partners?.length || 0;
    const maxPartners = this.maxPartnerships;
    
    if (currentCount >= maxPartners) {
      return `At Maximum Capacity (${currentCount}/${maxPartners})`;
    }
    return `Partner Up (${currentCount}/${maxPartners})`;
  }

  // Activity Management Methods
  onDeleteActivity(activity: Activity) {
    if (activity.type === 'donation') {
      this.deleteDonation(Number(activity.id));
    } else if (activity.type === 'mission') {
      this.deleteMission(activity.id);
    }
  }

  onEditActivity(activity: Activity) {
    if (activity.type === 'donation') {
      this.editDonation(activity.id);
    } else if (activity.type === 'mission') {
      this.editMission(activity.id);
    }
  }
  private deleteMission(id: string) {
    const missionId = parseInt(id, 10);
    if (confirm('Are you sure you want to delete this mission?')) {
      this.clearMessages();
      this.missionService.deleteMission(missionId).subscribe({
        next: () => {
          this.loadMissions();
          this.partnershipSuccess = 'Mission deleted successfully';
          setTimeout(() => this.partnershipSuccess = null, 3000);
        },
        error: (err) => {
          console.error('Error deleting mission:', err);
          this.partnershipError = 'Failed to delete mission';
          setTimeout(() => this.partnershipError = null, 3000);
        }
      });
    }
  }

  private editDonation(id: string) {
    const donationId = parseInt(id, 10);
    this.router.navigate(['/association/account/edit-donation', donationId]);
  }

  private editMission(id: string) {
    const missionId = parseInt(id, 10);
    this.router.navigate(['/association/account/edit-mission', missionId]);
  }


  // Partnership Button Methods
  getPartnershipButtonTooltip(partner: Association): string {
    const currentPartners = this.partners.length;
    const maxPartners = this.maxPartnerships;
    
    if (currentPartners >= maxPartners) {
      return `You've reached your maximum partnerships (${maxPartners}). Upgrade your tier to partner with more organizations.`;
    }
    
    return `Create partnership with ${partner.associationName}`;
  }

  getPartnershipButtonText(partner: Association): string {
    if (!this.partners || !this.partnershipTier) return 'Loading...';
    
    const currentCount = this.partners.length;
    const maxPartners = this.maxPartnerships;
    
    if (this.partners.some(p => p.idAssociation === partner.idAssociation)) {
      return 'Already Partners';
    }
    
    if (currentCount >= maxPartners) {
      return `At Capacity (${currentCount}/${maxPartners})`;
    }
    
    return 'Create Partnership';
  }

  // Utility Methods
  clearMessages() {
    this.partnershipError = null;
    this.partnershipSuccess = null;
    this.error = null;
  }

  closeAllModals() {
    try {
      // First dismiss all modals
      this.modal.dismissAll();
      this.activeModals = [];
      
      // Then clean up after a delay
      return new Promise<void>(resolve => {
      setTimeout(() => {
        this.clearModalBackdrop();
          resolve();
        }, 300);
      });
    } catch (error) {
      // Silent fail for modal cleanup
      return Promise.resolve();
    }
  }

  private clearModalBackdrop() {
    try {
      // Remove modal-open class from body
      if (document.body.classList.contains('modal-open')) {
    document.body.classList.remove('modal-open');
      }
    
      // Remove any existing backdrop
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
    if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
        }
      });

      // Clear any inline styles added by NgbModal
      document.body.style.removeProperty('padding-right');
      document.body.style.removeProperty('overflow');
      } catch (error) {
      // Silent fail for modal cleanup
    }
  }

  async showCelebrationModal(newTier: string) {
    try {
      // Ensure all previous modals are closed
      await this.closeAllModals();
      
      // Wait a bit before showing new modal
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const modalRef = this.modal.open(CelebrationModalComponent, {
        centered: true,
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        animation: true
      });
      
      modalRef.componentInstance.title = 'Congratulations! 🎉';
      modalRef.componentInstance.message = `You've successfully upgraded to ${newTier} tier!`;
      modalRef.componentInstance.benefits = this.associationService.parseTierBenefits(newTier);

      // Handle modal closing
      modalRef.result.finally(() => {
        setTimeout(() => this.clearModalBackdrop(), 300);
      });
    } catch (error) {
      // If modal fails, just show toast
      this.toastr.success(`Successfully upgraded to ${newTier} tier!`);
    }
  }

  private showConfetti() {
    // Create and configure the confetti
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  // Add method to check if partnership is disabled
  isPartnershipDisabled(partner: Association): boolean {
    if (!this.partners || !this.partnershipTier) return true;
    
    // Check if already partnered
    const isAlreadyPartnered = this.partners.some(p => p.idAssociation === partner.idAssociation);
    if (isAlreadyPartnered) return true;

    // Check if at max capacity
    return this.partners.length >= this.maxPartnerships;
  }

  async removePartnership(partnerId: number | undefined) {
    if (!partnerId || !this.association?.idAssociation) return;

    this.clearMessages();
    this.associationService.removePartnership(this.association.idAssociation, partnerId).subscribe({
      next: async (response) => {
        // Get current partner count after removal
        const remainingPartners = (this.partners?.length || 1) - 1;
        
        // Determine new tier based on remaining partners
        let newTier = 'BRONZE';
        if (remainingPartners > 5) {
          newTier = 'GOLD';
        } else if (remainingPartners > 3) {
          newTier = 'SILVER';
        }
        
        // If no partners left, reset to BRONZE
        if (remainingPartners === 0) {
          if (this.association) {
            this.association.partnershipTier = 'BRONZE';
          }
          this.highestAchievedTier = 'BRONZE';
          localStorage.setItem('highestAchievedTier', 'BRONZE');
        }

        await this.loadPartnershipTier();
        this.loadPartners();
        this.loadRecommendedPartners();
        
        if (this.association) {
          this.association.partnershipScore = response.newScore;
        }

        this.partnershipSuccess = 'Partnership removed successfully';
        setTimeout(() => this.partnershipSuccess = null, 3000);
      },
      error: (err) => {
        this.partnershipError = err.error?.message || 'Failed to remove partnership';
        setTimeout(() => this.partnershipError = null, 3000);
      }
    });
  }

  // Partner limit methods
  public getPartnerMaxLimit(tier: string = 'BRONZE'): number {
    const limits = {
      'BRONZE': 3,
      'SILVER': 5,
      'GOLD': 10
    };
    return limits[tier.toUpperCase() as keyof typeof limits] || 3;
  }

  private async refreshDataAfterUpgrade() {
    if (!this.association?.idAssociation) return;
    
    try {
      this.loading = true;
      await this.forceRefreshAllData();
      
      // Clean up any modal artifacts
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) backdrop.remove();
    } catch (error) {
      console.error('Failed to refresh data after upgrade:', error);
      this.toastr.error('Please refresh the page to see all updates.');
    } finally {
      this.loading = false;
    }
  }

  // Update the template to use nextTierName instead of getNextTierName
  public getNextTierName(): string {
    return this.nextTierName;
  }

  // Add these methods
  openEditModal() {
    if (!this.association) return;
    
    // Initialize edit data with current values
    this.editAssociationData = {
      associationName: this.association.associationName || '',
      description: this.association.description || '',
      associationAddress: this.association.associationAddress || ''
    };

    // Open modal using Bootstrap
    const modalElement = document.getElementById('editAssociationModal');
    if (modalElement) {
      this.editModal = new bootstrap.Modal(modalElement);
      this.editModal.show();
    }
  }

  async onEditLogo(event: any) {
    if (!this.association?.idAssociation) {
      this.toastr.error('No association ID found');
      return;
    }

    const file = event.target.files[0];
    if (file) {
      try {
        // Convert file to base64
        const base64 = await this.convertToBase64(file);
        
        // Create the update data with the base64 image
        const updateData: Association = {
          ...this.association,
          associationLogoPath: base64
        };

        // Update the association with the new logo
        const updatedAssociation = await this.associationService.updateAssociation(
          this.association.idAssociation,
          updateData
        ).toPromise();

        if (updatedAssociation) {
          this.association = updatedAssociation;
          if (updatedAssociation.associationLogoPath) {
            this.loadImage(updatedAssociation.associationLogoPath);
          }
          this.toastr.success('Logo updated successfully');
        }
      } catch (error) {
        console.error('Error updating logo:', error);
        this.toastr.error('Failed to update logo');
      }
    }
  }

  private convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  async updateAssociation(form: NgForm) {
    if (!form.valid) {
      this.toastr.error('Please fill in all required fields');
      return;
    }

    if (!this.association?.idAssociation) {
      this.toastr.error('No association ID found');
      return;
    }

    try {
      // Create a minimal update data object with only the fields being changed
      const updateData: Partial<Association> = {
        idAssociation: this.association.idAssociation,
        associationName: this.editAssociationData.associationName.trim(),
        associationAddress: this.editAssociationData.associationAddress.trim(),
        description: this.editAssociationData.description.trim(),
        status: this.association.status,
        partnershipTier: this.association.partnershipTier || 'BRONZE',
        partnershipScore: this.association.partnershipScore || 0,
        // Add required fields with empty strings
        associationPhone: this.association.associationPhone || '',
        associationEmail: this.association.associationEmail || '',
        // Set file paths to null
        associationLogoPath: null,
        registrationDocumentPath: null,
        legalDocumentPath: null
      };

      console.log('Sending update data:', updateData); // Debug log

      // Send the update request
      const updatedAssociation = await this.associationService.updateAssociation(
        this.association.idAssociation,
        updateData as Association
      ).toPromise();

      if (updatedAssociation) {
        this.association = updatedAssociation;
        this.editAssociationData = {
          associationName: '',
          description: '',
          associationAddress: ''
        };
        if (this.editModal) {
          this.editModal.hide();
        }
        this.toastr.success('Association profile updated successfully');
        this.loadAssociation(); // Refresh the data
      }
    } catch (error: any) {
      console.error('Error updating association:', error);
      this.toastr.error('Failed to update association profile. Please try again.');
    }
  }

  onViewActivity(activity: Activity) {
    this.selectedActivity = activity;
    if (activity.type === 'donation') {
      this.associationDonationService.getDonationById(Number(activity.id)).subscribe({
        next: (donation: Donation) => {
          if (this.selectedActivity) {
            this.selectedActivity.donationDetails = donation;
            // Fetch cagnotte details
            this.associationDonationService.getCagnotteByDonationId(Number(activity.id)).subscribe({
              next: (cagnotte) => {
                if (this.selectedActivity) {
                  this.selectedActivity.donationDetails.cagnotteenligne = cagnotte;
                }
              },
              error: (error) => {
                console.error('Error fetching cagnotte details:', error);
              }
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching donation details:', error);
        }
      });
    } else if (activity.type === 'mission') {
      this.missionService.getMissionById(Number(activity.id)).subscribe({
        next: (mission: Mission) => {
          if (this.selectedActivity) {
            this.selectedActivity.missionDetails = mission;
            // Load mission image
            this.loadMissionImage(mission);
            // Fetch mission roles
            this.missionService.getMissionRolesByMissionId(Number(activity.id)).subscribe({
              next: (roles) => {
                if (this.selectedActivity) {
                  this.selectedActivity.missionDetails.missionRoles = roles;
                }
              },
              error: (error) => {
                console.error('Error fetching mission roles:', error);
              }
            });
          }
        },
        error: (error: any) => {
          console.error('Error fetching mission details:', error);
        }
      });
    }
  }

  private loadMissionImage(mission: Mission): void {
    if (mission.missionLogoPath) {
      this.missionService.getMissionLogo(mission.missionLogoPath).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.missionImageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        },
        error: () => {
          this.missionImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.defaultMissionImage);
        }
      });
    } else {
      this.missionImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.defaultMissionImage);
    }
  }

  private deleteDonation(id: number): void {
    this.associationDonationService.deleteDonation(id).subscribe({
      next: () => {
        this.toastr.success('Donation deleted successfully');
        this.loadDonations();
        this.loadMissions();
      },
      error: (error) => {
        console.error('Error deleting donation:', error);
        this.toastr.error('Failed to delete donation');
      }
    });
  }

  getPriorityLabel(priority: number): string {
    switch (priority) {
      case 1:
        return 'Low';
      case 2:
        return 'Medium';
      case 3:
        return 'High';
      default:
        return 'Unknown';
    }
  }

  getDonationStatus(donation: Donation): { 
    status: 'complete' | 'no_progress' | 'low_engagement' | 'on_track' | 'slow_progress',
    badge: string,
    badgeClass: string,
    message: string
  } {
    const endDate = new Date(donation.endDate);
    const today = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const progress = (donation.quantiteDonnee || 0) / (donation.quantiteDemandee || 1);
    const dailyProgress = progress / daysRemaining;

    if (progress >= 1) {
      return {
        status: 'complete',
        badge: 'Completed',
        badgeClass: 'bg-success',
        message: 'Donation goal has been reached!'
      };
    }

    if (progress === 0) {
      return {
        status: 'no_progress',
        badge: 'No Progress',
        badgeClass: 'bg-danger',
        message: 'No donations received yet'
      };
    }

    if (dailyProgress < 0.1) {
      return {
        status: 'low_engagement',
        badge: 'Low Engagement',
        badgeClass: 'bg-warning',
        message: 'Current progress is below expected rate'
      };
    }

    if (dailyProgress >= 0.2) {
      return {
        status: 'on_track',
        badge: 'On Track',
        badgeClass: 'bg-success',
        message: 'Progress is meeting expectations'
      };
    }

    return {
      status: 'slow_progress',
      badge: 'Slow Progress',
      badgeClass: 'bg-info',
      message: 'Progress is steady but could be improved'
    };
  }
}