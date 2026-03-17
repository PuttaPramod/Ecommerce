import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['../auth.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.isLoading = true;

    const payload = {
      name: this.signupForm.value.name,
      email: this.signupForm.value.email,
      password: this.signupForm.value.password
    };

    this.http.post<{ message: string }>('http://localhost:3000/api/signup', payload)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          alert(res.message || 'Signup successful');
          this.signupForm.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading = false;
          alert(err.error?.message || 'Signup failed');
          console.error(err);
        }
      });
  }
}
