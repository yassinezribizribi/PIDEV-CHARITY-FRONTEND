// src/app/components/list-request/list-request.component.ts
import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../../services/request.service';
import { Request } from '../../../models/Request.model';
import { Response } from '../../../models/Response.model';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../../../components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-request',
  templateUrl: './list-request.component.html',
  styleUrls: ['./list-request.component.scss'],
  imports: [NavbarComponent, FormsModule, FooterComponent,CommonModule],
  

})

export class ListRequestComponent implements OnInit {
  listRequests: Request[] = []; // Liste des demandes
  newRequest: any = {
    idRequest:0,
    object: '',
    content: '',
    isUrgent: false,
    dateRequest: new Date(),
  }; // Nouvelle demande
  showForm: boolean = false; // Afficher/masquer le formulaire

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequests(); // Charge les demandes au démarrage
  }

  // Charger toutes les demandes
  loadRequests(): void {
    this.requestService.getAllRequests().subscribe({
      next: (requests) => {
        this.listRequests = requests; // Met à jour la liste des demandes
      },
      error: (err) => {
        console.error('Error loading requests:', err);
      },
    });
  }

  // Ajouter une nouvelle demande
  // Dans la méthode addRequest
addRequest(): void {
  this.newRequest = {
        
    "dateRequest":  new Date(),
  "object": this.newRequest.object,
  "content": this.newRequest.content,
  "isUrgent": this.newRequest.isUrgent,
  "forumId": 0
  
};
  this.requestService.addRequest(this.newRequest).subscribe({
    next: (addedRequest: Request) => { // Ajoutez le type `Request`
      this.listRequests.push(addedRequest);
      
      this.showForm = false;
    },
    error: (err: any) => { // Ajoutez le type `any` ou un type spécifique
      console.error('Error adding request:', err);
    },
  });
}

  // Afficher/masquer le formulaire
  test() {
     this.showForm = !this.showForm;
    console.log(this.showForm)
  }
  response(id:any){
    this.router.navigateByUrl('support-refugees-forum/'+id)
  }
}