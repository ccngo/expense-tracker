import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HelpDrawerComponent } from './components/help-drawer';
import { HelpService } from './services/help';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatIconModule, MatButtonModule, HelpDrawerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  help = inject(HelpService);
}
