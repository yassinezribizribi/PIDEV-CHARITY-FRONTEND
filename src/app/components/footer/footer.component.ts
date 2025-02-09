import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    imports: [
        CommonModule,
        RouterLink
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {

  date:any

  constructor(){
    this.date = new Date().getFullYear()
  }

  social = [
    {
      icon:'dribbble',
      link:'https://dribbble.com/shreethemes'
    },
    {
      icon:'linkedin',
      link:'http://linkedin.com/company/shreethemes'
    },
    {
      icon:'facebook',
      link:'https://www.facebook.com/shreethemes'
    },
    {
      icon:'instagram',
      link:'https://www.instagram.com/shreethemes'
    },
    {
      icon:'twitter',
      link:'https://twitter.com/shreethemes'
    },
  ]

  company = [
    {
      name:'About us',
      link:'/aboutus'
    },
    {
      name:'Services',
      link:'/services'
    },
    {
      name:'Team',
      link:'/team'
    },
    {
      name:'Forums',
      link:'/forums'
    },
    {
      name:'Blog',
      link:'/blogs'
    },
    {
      name:'Login',
      link:'/login'
    },
  ]

  link = [
    {
      name:'Helpcenter',
      link:'/faqs'
    },
    {
      name:'Terms of Services',
      link:'/terms'
    },
    {
      name:'Privacy Policy',
      link:'/privacy'
    },
  ]

  link2 = [
    'Privacy','Terms','FAQs','Contact'
  ]

}
