import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from "../../../components/navbar/navbar.component";
import { FooterComponent } from "../../../components/footer/footer.component";
import { RequestService } from 'src/app/services/request.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-request',
  imports: [RouterLink, NavbarComponent, FooterComponent,CommonModule],
  templateUrl: './list-request.component.html',
  styleUrl: './list-request.component.scss'
})
export class ListRequestComponent implements OnInit{
listRequestes:any=[
  {content:'eeeeeee', object:'tttttttt'},
  {content:'k,nkl,kl', object:'ttttttt51465654t'},
]
  constructor( private requestService: RequestService){}
  ngOnInit(): void {
    console.log('eeeee')
    this.requestService.getAllRequests().subscribe((res:any)=>{
      console.log('rrrrrrrr')
      console.log(res)
     // this.listRequestes=res
    })
  }

}
