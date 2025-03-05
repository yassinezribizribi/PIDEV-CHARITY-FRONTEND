import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { RequestService } from '../../../services/request.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-list-request',
  imports: [RouterLink, NavbarComponent, FooterComponent,CommonModule,FormsModule],
  templateUrl: './list-request.component.html',
  styleUrl: './list-request.component.scss'
})
export class ListRequestComponent implements OnInit{
showForm: any;
toggleForm() {
throw new Error('Method not implemented.');
}
addRequest() {
throw new Error('Method not implemented.');
}
listRequestes:any=[
  {content:'eeeeeee', object:'tttttttt'},
  {content:'k,nkl,kl', object:'ttttttt51465654t'},
]
newRequest: any;
  constructor( private requestService: RequestService){}
  ngOnInit(): void {
    console.log('eeeee')
    this.requestService.getAllRequests().subscribe((res:any)=>{
      console.log('rrrrrrrr')
      console.log(res)
     this.listRequestes=res
    })
  }

}