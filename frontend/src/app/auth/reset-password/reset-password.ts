import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './reset-password.html',
  styleUrls: ['../auth.component.css']
})
export class ResetComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  token = this.route.snapshot.params['token'];

  onReset() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    if (this.resetForm.value.password !== this.resetForm.value.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.http.post<{ message: string }>(`http://localhost:3000/api/reset/${this.token}`, { password: this.resetForm.value.password })
      .subscribe(
        res => {
          alert(res.message);
          this.router.navigate(['/login']);
        },
        err => {
          alert(err.error?.message || 'Invalid or expired token');
        }
      );
  }
}
