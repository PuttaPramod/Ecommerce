import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  readonly loginForm;
  isSubmitting = false;
  submitError = '';
  showPassword = false;
  private loginRequest?: Subscription;
  private loginTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.submitError = 'Please correct the highlighted fields before signing in.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.loginTimeout = setTimeout(() => {
      this.loginRequest?.unsubscribe();
      this.isSubmitting = false;
      this.submitError = 'Sign-in could not reach the server. Start the backend and MongoDB, then try again.';
      this.changeDetector.markForCheck();
    }, 5000);

    this.loginRequest = this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        this.clearLoginRequest();
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.clearLoginRequest();
        this.submitError = error?.name === 'TimeoutError'
          ? 'The server did not respond. Make sure the backend and MongoDB are running.'
          : error?.error?.message || 'We could not sign you in. Please try again.';
        this.changeDetector.markForCheck();
      },
    });
  }

  private clearLoginRequest(): void {
    if (this.loginTimeout) clearTimeout(this.loginTimeout);
    this.loginTimeout = undefined;
    this.isSubmitting = false;
  }
}
