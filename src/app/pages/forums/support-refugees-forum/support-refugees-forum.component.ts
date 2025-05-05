// src/app/components/support-refugees-forum/support-refugees-forum.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { ResponseService } from '../../../services/response.service';
import { Request } from '../../../models/Request.model';
import { ForumResponse } from '../../../models/Response.model';
import { FooterComponent } from "../../../components/footer/footer.component";
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-support-refugees-forum',
  templateUrl: './support-refugees-forum.component.html',
  styleUrls: ['./support-refugees-forum.component.scss'],
  standalone: true,
  imports: [FooterComponent, NavbarComponent, FormsModule, CommonModule, RouterModule],
})
export class SupportRefugeesForumComponent implements OnInit {
  // Properties for filtering and search
  searchTerm: string = '';
  statusFilter: string = 'all';
  filteredRequests: Request[] = [];
  
  // Loading and error states
  loading: boolean = false;
  error: string | null = null;
  
  // Request lists
  listRequests: Request[] = [];
  listResponses: ForumResponse[] = [];
  
  // New request form
  newRequest: Request = {
    object: '',
    content: '',
    isUrgent: false,
    dateRequest: new Date(),
    response: false,
    responses: [] // Initialize empty responses array
  };
  
  // New response form
  newResponse: ForumResponse = {
    content: '',
    requestId: 0,
    idResponse: 0,
    dateResponse: new Date(),
    object: '',
    senderId: 0
  };
  
  showForm: boolean = false;
  requestId: number | null = null;

  private responseModal: Modal | null = null;

  constructor(
    private requestService: RequestService,
    private responseService: ResponseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
    // Initialize the modal
    const modalElement = document.getElementById('responseModal');
    if (modalElement) {
      this.responseModal = new Modal(modalElement);
      // Add event listener for modal hidden event
      modalElement.addEventListener('hidden.bs.modal', () => {
        this.newResponse = {
          content: '',
          requestId: 0,
          idResponse: 0,
          dateResponse: new Date(),
          object: '',
          senderId: 0
        };
      });
    }
  }

  // Load all requests
  loadRequests(): void {
    this.loading = true;
    this.error = null;
    
    this.requestService.getAllRequestsWithResponses().subscribe({
      next: (requests: Request[]) => {
        // Ensure each request has a responses array
        this.listRequests = requests.map(request => ({
          ...request,
          responses: request.responses || []
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading requests. Please try again later.';
        this.loading = false;
        console.error('Error loading requests:', err);
      }
    });
  }

  // Apply filters to requests
  applyFilters(): void {
    this.filteredRequests = this.listRequests.filter(request => {
      const matchesSearch = request.object.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          request.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' ||
                          (this.statusFilter === 'urgent' && request.isUrgent) ||
                          (this.statusFilter === 'normal' && !request.isUrgent);
      
      return matchesSearch && matchesStatus;
    });
  }

  // Get creator name for a request
  getCreatorName(request: Request): string {
    if (request.user?.firstName && request.user?.lastName) {
      return `${request.user.firstName} ${request.user.lastName}`;
    }
    return '';
  }

  // Get initials for avatar
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Get avatar color based on request
  getAvatarColor(request: Request): string {
    const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8'];
    const index = request.idRequest ? request.idRequest % colors.length : 0;
    return colors[index];
  }

  // Check if request belongs to current user
  isOwnRequest(request: Request): boolean {
    // TODO: Implement user authentication check
    return false;
  }

  // Create new request
  createRequest(): void {
    this.loading = true;
    this.error = null;

    // Create a new request object with forumId
    const requestToCreate = {
      ...this.newRequest,
      forumId: 2 // Assuming 2 is the ID for the support refugees forum
    };

    this.requestService.addRequest(requestToCreate).subscribe({
      next: (response: Request) => {
        this.loadRequests();
        this.newRequest = {
          object: '',
          content: '',
          isUrgent: false,
          dateRequest: new Date(),
          response: false,
          responses: []
        };
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error creating request. Please try again later.';
        this.loading = false;
        console.error('Error creating request:', err);
      }
    });
  }

  // Open response modal
  openResponseModal(request: Request): void {
    if (!request.idRequest) {
      this.error = 'Invalid request';
      return;
    }
    this.requestId = request.idRequest;
    this.newResponse = {
      content: '',
      requestId: request.idRequest,
      idResponse: 0,
      dateResponse: new Date(),
      object: '',
      senderId: 0
    };
    this.responseModal?.show();
  }

  // View responses for a request
  viewResponses(request: Request): void {
    if (request.idRequest) {
      this.requestId = request.idRequest;
      this.loadResponses(request.idRequest);
    }
  }

  // Load responses for a request
  loadResponses(requestId: number): void {
    this.loading = true;
    this.responseService.getResponsesByRequestId(requestId).subscribe({
      next: (responses: ForumResponse[]) => {
        this.listResponses = responses;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error loading responses. Please try again later.';
        this.loading = false;
        console.error('Error loading responses:', err);
      }
    });
  }

  // Add a new response
  addResponse(): void {
    if (!this.newResponse.content.trim()) {
      this.error = 'Content is required';
      return;
    }

    if (!this.requestId) {
      this.error = 'Request ID is required';
      return;
    }

    this.loading = true;
    this.error = null;

    // Set the requestId in the response object
    this.newResponse.requestId = this.requestId;
    this.newResponse.dateResponse = new Date();

    this.responseService.addResponse(this.newResponse, this.requestId).subscribe({
      next: (response: ForumResponse) => {
        // Find the request and add the new response to its responses array
        const request = this.listRequests.find(r => r.idRequest === this.requestId);
        if (request) {
          if (!request.responses) {
            request.responses = [];
          }
          request.responses.push(response);
        }
        // Hide the modal
        this.responseModal?.hide();
        // Reset the response form
        this.newResponse = {
          content: '',
          requestId: 0,
          idResponse: 0,
          dateResponse: new Date(),
          object: '',
          senderId: 0
        };
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Error adding response. Please try again later.';
        this.loading = false;
        console.error('Error adding response:', err);
      }
    });
  }

  // Toggle form visibility
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  // Navigate back
  back(): void {
    this.router.navigateByUrl('forums/list-request');
  }
}