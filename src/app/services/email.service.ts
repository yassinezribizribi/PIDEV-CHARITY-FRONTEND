import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly BASE_URL = environment.apiUrl;

  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n\n');
      console.log('%c ========== EMAIL SENT ========== ', 'background: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px;');
      console.log('%cTo: ' + template.to, 'color: #2196F3; font-weight: bold;');
      console.log('%cSubject: ' + template.subject, 'color: #2196F3; font-weight: bold;');
      console.log('%c----------------------------------------', 'color: #666');
      console.log('%cBody:', 'color: #2196F3; font-weight: bold;');
      console.log(template.body);
      console.log('%c----------------------------------------', 'color: #666');
      console.log('%c ================================== ', 'background: #4CAF50; color: white; font-size: 16px; font-weight: bold; padding: 4px 8px;');
      console.log('\n\n');
      
      if (!environment.production) {
        alert(`Email sent to ${template.to}!\n\nPlease check your browser console (F12) to see the full email content.`);
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  getVerificationEmailTemplate(association: any): EmailTemplate {
    const loginUrl = `/login`;
    
    return {
      to: association.subscriber ? association.subscriber.email : association.email,
      subject: 'Your Association Account Has Been Verified',
      body: `
        <h2>Congratulations!</h2>
        <p>Dear ${association.associationName},</p>
        <p>We are pleased to inform you that your association account has been verified successfully.</p>
        <p>You can now log in to your account using:</p>
        <ul>
          <li>Email: ${association.subscriber ? association.subscriber.email : association.email}</li>
          <li>Password: The password you created during registration</li>
        </ul>
        <p><a href="${loginUrl}" style="padding: 10px 20px; background-color: #2f55d4; color: white; text-decoration: none; border-radius: 5px;">Login to Your Account</a></p>
        <p>If you've forgotten your password, you can reset it using the "Forgot Password" link on the login page.</p>
        <p>Best regards,<br>The Solidarity & Refugee Team</p>
      `
    };
  }

  getRejectionEmailTemplate(association: any): EmailTemplate {
    const loginUrl = `/login`;
    
    return {
      to: association.subscriber ? association.subscriber.email : association.email,
      subject: 'Your Association Account Has Been Rejected',
      body: `
        <h2>We're Sorry</h2>
        <p>Dear ${association.associationName},</p>
        <p>After careful consideration, we regret to inform you that your association account did not meet our verification criteria and has been rejected.</p>
        <p>If you believe this is a mistake or if you have additional information to support your application, please contact our support team.</p>
        <p><a href="${loginUrl}" style="padding: 10px 20px; background-color: #d9534f; color: white; text-decoration: none; border-radius: 5px;">Contact Support</a></p>
        <p>Best regards,<br>The Solidarity & Refugee Team</p>
      `
    };
  }

  sendVerificationEmail(email: string, associationName: string): Promise<boolean> {
    // Build a minimal association object that contains the needed properties
    const association = {
      subscriber: { email },
      associationName
    };
    const template = this.getVerificationEmailTemplate(association);
    return this.sendEmail(template);
  }

  sendRejectionEmail(email: string, associationName: string): Promise<boolean> {
    const association = {
      subscriber: { email },
      associationName
    };
    const template = this.getRejectionEmailTemplate(association);
    return this.sendEmail(template);
  }
}
