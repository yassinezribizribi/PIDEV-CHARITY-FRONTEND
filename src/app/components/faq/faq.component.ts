import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-faq',
    imports: [
        CommonModule
    ],
    templateUrl: './faq.component.html',
    styleUrl: './faq.component.scss'
})
export class FaqComponent {
  faqData = [
    {
      id:1,
      title:'How does it work ?',
      desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form."
    },
    {
      id:2,
      title:'Do I need a designer to use Smilecare ?',
      desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form."
    },
    {
      id:3,
      title:'What do I need to do to start selling ?',
      desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form."
    },
    {
      id:4,
      title:'What happens when I receive an order ?',
      desc:"There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form."
    },
  ]

  activeTab:number = 1 

  onTabClick(e:any,index:number){
    e.preventDefault();
    this.activeTab = index
  }
}
