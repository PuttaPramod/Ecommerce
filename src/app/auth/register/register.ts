import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule,Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm:FormGroup;
  isSubmitting = false;
  submitError = '';
  successMessage = '';
  constructor(private fb:FormBuilder, private authService:AuthService, private router: Router){
    this.registerForm=this.fb.group({
      name:["",[Validators.required]],
      email:["",[Validators.required,Validators.email]],
      mobile:["",[Validators.required,Validators.minLength(10),Validators.maxLength(10)]],
      password:["",[Validators.required,Validators.minLength(8)]],
    }
    )
  }
    onSubmit(){
      if (this.registerForm.invalid) {
        this.registerForm.markAllAsTouched();
        this.submitError = 'Please correct the highlighted fields before creating your account.';
        return;
      }

      this.isSubmitting = true;
      this.submitError = '';
      this.successMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next:(data)=>{
          this.isSubmitting = false;
          this.successMessage = data?.message || 'Your account has been created successfully.';
          setTimeout(() => this.router.navigateByUrl('/login'), 700);
        },
        error:(err)=>{
          this.isSubmitting = false;
          this.submitError = err?.name === 'TimeoutError'
            ? 'The server did not respond. Make sure the backend and MongoDB are running.'
            : err?.error?.message || 'We could not create your account. Please try again.';
        }
      })
    }
}
