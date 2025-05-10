import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { NotificationService } from '../../services/notificationB.service';
import { Notification } from '../../services/notificationB.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;
  errorMessage = '';
  today: Date = new Date();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Erreur chargement notifications';
        this.isLoading = false;
      }
    });
  }

  isHoliday(date: string | Date): boolean {
    return this.notificationService.isHoliday(new Date(date));
  }

  onProposeDate(id: number): void {
    const newDate = prompt("🗓️ Entrez une nouvelle date (YYYY-MM-DDTHH:mm):");
    if (newDate) {
      this.notificationService.proposeDate(id, new Date(newDate)).subscribe({
        next: () => window.location.reload(),
        error: () => alert('❌ Erreur lors de la proposition.')
      });
    }
  }

  onConfirmDate(id: number): void {
    this.notificationService.confirmDate(id).subscribe({
      next: () => window.location.reload(),
      error: () => alert('❌ Erreur lors de la confirmation.')
    });
  }
}
