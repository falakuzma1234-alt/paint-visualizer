import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  mode: 'login' | 'register' = 'login';
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  switchMode() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit() {
    this.error = '';

    if (!this.email.includes('@')) { this.error = 'Please enter a valid email.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    if (this.mode === 'register' && !this.name.trim()) { this.error = 'Please enter your name.'; return; }

    this.loading = true;

    const request$ = this.mode === 'login'
      ? this.auth.login(this.email, this.password)
      : this.auth.register(this.name.trim(), this.email, this.password);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Cannot connect to the server. Is the backend running?';
      },
    });
  }
}