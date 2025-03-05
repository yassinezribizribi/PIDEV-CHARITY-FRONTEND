import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResponseService } from '../../../services/response.service';
import { Response } from '../../../models/Response.model';
import { RequestService } from '../../../services/request.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';
import { FooterComponent } from '../../../components/footer/footer.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-support-refugees-forum',
  templateUrl: './support-refugees-forum.component.html',
  styleUrls: ['./support-refugees-forum.component.scss'],
  standalone: true,
  imports: [NavbarComponent, FooterComponent, FormsModule]
})
export class SupportRefugeesForumComponent implements OnInit {
  listResponses: Response[] = [];
  newResponse: Response = {
    content: '',
    object: '',
    requestId: 0
  };
  showForm: boolean = false;
  idRequest: number | null = null;
  request: any; // Replace 'any' with a proper Request model if available

  constructor(
    private responseService: ResponseService,
    private requestService: RequestService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idRequest = +params['idRequest']; // Convert to number
      console.log('ID Request:', this.idRequest);
      if (this.idRequest) {
        this.newResponse.requestId = this.idRequest; // Set requestId for new responses
        this.getRequestDetails(this.idRequest);
        this.getAllResponses(this.idRequest);
      }
    });
  }

  getRequestDetails(idRequest: number): void {
    this.requestService.getRequestById(idRequest).subscribe({
      next: (request) => {
        this.request = request;
        console.log('Request loaded:', this.request);
      },
      error: (err) => {
        console.error('Error fetching request:', err);
      }
    });
  }

  getAllResponses(idRequest: number): void {
    this.responseService.getAllResponsesByRequest(idRequest).subscribe({
      next: (responses) => {
        this.listResponses = responses;
        console.log('Responses loaded:', this.listResponses);
      },
      error: (err) => {
        console.error('Error fetching responses:', err);
      }
    });
  }

  addResponse(): void {
    if (!this.newResponse.content || !this.idRequest) {
      console.error('Content and Request ID are required.');
      return;
    }

    this.requestService.addResponseToRequest(this.idRequest, this.newResponse).subscribe({
      next: (response) => {
        console.log('✅ Response added successfully', response);
        this.listResponses.push(response); // Add the new response to the list
        this.resetResponseForm();
        this.showForm = false; // Hide the form after submission
      },
      error: (err) => {
        console.error('❌ Error adding response:', err);
        alert('Failed to add response. Please try again.');
      }
    });
  }

  resetResponseForm(): void {
    this.newResponse = { content: '', object: '', requestId: this.idRequest || 0 };
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetResponseForm(); // Reset form when closing
    }
  }
}