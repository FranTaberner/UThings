import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.html',
  styleUrl: './error.css'
})
export class Error {
  private router = inject(Router);

  irAlHome() {
    this.router.navigate(['/home']);
  }
}
