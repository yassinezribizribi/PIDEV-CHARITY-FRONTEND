// src/app/components/support-refugees-forum/support-refugees-forum.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RequestService } from '../../../services/request.service';
import { ResponseService } from '../../../services/response.service';
import { Request } from '../../../models/Request.model';
import { Response } from '../../../models/Response.model';
import { FooterComponent } from "../../../components/footer/footer.component";
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-support-refugees-forum',
  templateUrl: './support-refugees-forum.component.html',
  styleUrls: ['./support-refugees-forum.component.scss'],
  imports: [FooterComponent, NavbarComponent,FormsModule,CommonModule,RouterModule],
})
export class SupportRefugeesForumComponent implements OnInit {
  listRequests: Request[] = []; // Liste des demandes
  listResponses: Response[] = []; // Liste des réponses
  newResponse: Response = {
    content: '', requestId: 0,
    idResponse: 0,
    dateResponse: null, // Date de la réponse
  }; // Nouvelle réponse
  showForm: boolean = false; // Afficher/masquer le formulaire
  requestId: number | null = null; // ID de la demande sélectionnée

  constructor(
    private requestService: RequestService,
    private responseService: ResponseService,
    private route: ActivatedRoute,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.requestId = +params['idRequest']; // Récupère l'ID de la demande
      if (this.requestId) {
        this.loadRequestDetails(this.requestId);
        this.loadResponses(this.requestId);
      }
    });
  }

  // Charger les détails de la demande
  loadRequestDetails(requestId: number): void {
    this.requestService.getRequestById(requestId).subscribe({
      next: (request: any) => {
        this.listRequests = [request]; // Ajoute la demande à la liste
      },
      error: (err: any) => {
        console.error('Error loading request:', err);
      },
    });
  }

  // Charger les réponses pour une demande
  loadResponses(requestId: number): void {
    this.responseService.getResponsesByRequestId(requestId).subscribe({
      next: (responses: Response[]) => {
        this.listResponses = responses; // Met à jour la liste des réponses
      },
      error: (err: any) => {
        console.error('Error loading responses:', err);
      },
    });
  }

  // Ajouter une nouvelle réponse
  addResponse(): void {
    if (!this.newResponse.content.trim()) {
      console.error('Content is required');
      return;
    }

    this.newResponse.requestId = this.requestId!; // Associe la réponse à la demande

    this.responseService.addResponse(this.newResponse,this.requestId??0).subscribe({
      next: (response: any) => {
        this.loadRequestDetails(this.requestId??0);
        this.loadResponses(this.requestId??0);
        this.showForm = false; // Masque le formulaire
      },
      error: (err: any) => {
        console.error('Error adding response:', err);
      },
    });
  }

  // Afficher/masquer le formulaire
  toggleForm(): void {
    this.showForm = !this.showForm;
  }
  back(){
    this.router.navigateByUrl('forums/list-rquest')
  }
}