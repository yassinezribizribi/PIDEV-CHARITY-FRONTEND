import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-causes',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './causes.component.html',
    styleUrl: './causes.component.scss'
})
export class CausesComponent {
 causesData = [
  {
    image:'assets/images/cause/1.jpg',
    title:'Child Support',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
  {
    image:'assets/images/cause/2.jpg',
    title:'Clean Water',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
  {
    image:'assets/images/cause/3.jpg',
    title:'Help to Mothers',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
  {
    image:'assets/images/cause/4.jpg',
    title:'New School',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
  {
    image:'assets/images/cause/5.jpg',
    title:'Food for All',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
  {
    image:'assets/images/cause/6.jpg',
    title:'Water For All',
    desc:'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    fund:'Raised 60% of $10000',
    value1:'$ 6000',
    value2:'$ 10000'
  },
 ]
}
