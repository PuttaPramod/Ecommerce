import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['../auth.component.css']
})
export class ForgotComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  onSubmit() {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    this.http.post<{ message: string }>('http://localhost:3000/api/forgot', this.forgotForm.value)
      .subscribe(
        res => {
          alert(res.message);
          this.router.navigate(['/login']);
        },
        err => {
          alert(err.error?.message || 'Something went wrong');
        }
      );
  }
}
