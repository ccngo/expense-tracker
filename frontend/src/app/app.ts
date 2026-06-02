import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HelpDrawerComponent } from './components/help-drawer';
import { HelpService } from './services/help';
import { AuthService } from './services/auth';
import { LoginComponent } from './pages/login/login';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, MatDialogModule, HelpDrawerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  help = inject(HelpService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.checkPasswordRequired();
  }

  private checkPasswordRequired() {
    this.authService.hasPassword().subscribe(
      response => {
        if (response.hasPassword && !this.authService.getToken()) {
          this.showLoginModal();
        }
      },
      error => {
        console.error('Error checking password requirement:', error);
      }
    );
  }

  private showLoginModal() {
    const dialogRef = this.dialog.open(LoginComponent, {
      width: '400px',
      disableClose: true,
      panelClass: 'login-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        this.showLoginModal();
      }
    });
  }
}
