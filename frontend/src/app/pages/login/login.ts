import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="login-container">
      <h2>Enter Password</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field>
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="Enter password" />
        </mat-form-field>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <button mat-raised-button color="primary" type="submit" [disabled]="isLoading()">
          {{ isLoading() ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      padding: 2rem;
      max-width: 300px;
    }
    h2 {
      margin-bottom: 1.5rem;
      text-align: center;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    button {
      width: 100%;
    }
    .error-message {
      color: #d32f2f;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      text-align: center;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<LoginComponent>);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const password = this.form.get('password')?.value;
    this.authService.login(password).subscribe({
      next: () => {
        this.snackbar.open('Logged in successfully', 'OK', { duration: 2000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error || 'Invalid password');
      }
    });
  }
}
