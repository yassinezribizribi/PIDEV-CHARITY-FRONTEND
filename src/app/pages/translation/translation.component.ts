import { Component } from '@angular/core';
import { TranslationService } from '../../services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-translation',
  templateUrl: './translation.component.html',
  styleUrls: ['./translation.component.scss'],
  imports: [FormsModule] // 
})
export class TranslationComponent {
  text = '';
  sourceLang = 'fr';
  selectedTargets: string[] = ['en', 'ar'];
  result: { [key: string]: string } = {};

  constructor(private translationService: TranslationService) {}

  onTranslate(): void {
    this.translationService.translate(this.text, this.sourceLang, this.selectedTargets)
      .subscribe(res => this.result = res);
  }
  toggleLang(lang: string): void {
    if (this.selectedTargets.includes(lang)) {
      this.selectedTargets = this.selectedTargets.filter(l => l !== lang);
    } else {
      this.selectedTargets.push(lang);
    }
  }
  
}
