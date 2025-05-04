import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Request } from '../../../models/Request.model';
import { Response } from '../../../models/Response.model';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { FooterComponent } from "../../../components/footer/footer.component";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-request',
  templateUrl: './list-request.component.html',
  styleUrls: ['./list-request.component.scss'],
  imports: [FooterComponent, ReactiveFormsModule, FormsModule, NavbarComponent,CommonModule],
})
export class ListRequestComponent implements OnInit {
  listRequests: Request[] = []; // Liste des demandes
  filteredRequests: Request[] = []; // Liste des demandes filtrées
  newRequest: any = {
    idRequest: 0,
    object: '',
    content: '',
    isUrgent: false,
    dateRequest: new Date(),
  };
  showForm: boolean = false;
  urgentFilter: string = ''; // Filtre par urgence
  searchQuery: string = ''; // Recherche par texte

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.requestService.getAllRequests().subscribe({
      next: (requests) => {
        this.listRequests = requests;
        this.filteredRequests = [...requests]; // Initialiser les demandes filtrées
      },
      error: (err) => {
        console.error('Error loading requests:', err);
      },
    });
  }

  applyFilters(): void {
    let filtered = this.listRequests;

    // Filtre par urgence
    if (this.urgentFilter !== '') {
      filtered = filtered.filter(req => req.isUrgent.toString() === this.urgentFilter);
    }

    // Filtre par recherche
    if (this.searchQuery) {
      filtered = filtered.filter(req => req.object.toLowerCase().includes(this.searchQuery.toLowerCase()) || req.content.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }

    this.filteredRequests = filtered;
  }

  addRequest(): void {
    this.newRequest = {
      dateRequest: new Date(),
      object: this.newRequest.object,
      content: this.newRequest.content,
      isUrgent: this.newRequest.isUrgent,
      forumId: 1
    };

    this.requestService.addRequest(this.newRequest).subscribe({
      next: (addedRequest: Request) => {
        this.listRequests.push(addedRequest);
        this.applyFilters(); // Appliquer les filtres après l'ajout
        this.showForm = false;
      },
      error: (err: any) => {
        console.error('Error adding request:', err);
      },
    });
  }

  test() {
    this.showForm = !this.showForm;
    console.log(this.showForm);
  }

  response(id: any) {
    this.router.navigateByUrl('support-refugees-forum/' + id);
  }

  openResponseModal(req: Request): void {
    this.response(req.idRequest);
  }
}