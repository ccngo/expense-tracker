import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule
  ],
  template: `
    <div class="container">
      <h1>Settings</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Password Protection</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p class="description">Set an optional password to protect your expense tracker. After setting a password, you'll need to enter it when you reload the page.</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field>
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword" placeholder="Leave empty to remove password" />
              <mat-hint>At least 4 characters. Leave empty to disable password protection.</mat-hint>
            </mat-form-field>

            <mat-form-field>
              <mat-label>Confirm Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword" />
            </mat-form-field>

            @if (form.get('confirmPassword')?.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <div class="error-message">Passwords do not match</div>
            }

            @if (errorMessage()) {
              <div class="error-message">{{ errorMessage() }}</div>
            }

            <div class="actions">
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading()">
                {{ isLoading() ? 'Saving...' : 'Save Password' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 500px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1 {
      margin-bottom: 2rem;
    }
    .description {
      margin-bottom: 1.5rem;
      color: rgba(0, 0, 0, 0.6);
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 1rem;
    }
    .error-message {
      color: #d32f2f;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    .actions {
      margin-top: 2rem;
    }
    button {
      width: 100%;
    }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackbar = inject(MatSnackBar);

  isLoading = signal(false);
  errorMessage = signal('');

  form = this.fb.group(
    {
      newPassword: [''],
      confirmPassword: ['']
    },
    { validators: this.passwordMatchValidator }
  );

  ngOnInit() {
    // No initial load needed
  }

  submit() {
    if (this.form.invalid) return;

    const newPassword = this.form.get('newPassword')?.value || '';

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.setPassword(newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        const message = newPassword ? 'Password updated' : 'Password removed';
        this.snackbar.open(message, 'OK', { duration: 3000 });
        this.form.reset();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error || 'Error updating password');
      }
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value || '';
    const confirmPassword = control.get('confirmPassword')?.value || '';

    // If both are empty, it's valid (removing password)
    if (!newPassword && !confirmPassword) {
      return null;
    }

    // If one is empty but not the other, it's invalid
    if (!newPassword || !confirmPassword) {
      return control.get('confirmPassword')?.setErrors({ passwordMismatch: true }) && { passwordMismatch: true };
    }

    // If both are set, they must match
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
