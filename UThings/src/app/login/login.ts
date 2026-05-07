import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SesionService } from '../sesion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(SesionService);
  private router = inject(Router);

  esModoLogin = signal(true);

  username = signal('');
  email = signal('');
  password = signal('');
  mensaje = signal('');

  alternarModo() {
    this.esModoLogin.update(val => !val);
    this.mensaje.set('');
    this.username.set('');
    this.email.set('');
    this.password.set('');
  }

  enviar() {
    if (this.esModoLogin()) {
      this.authService.login(this.email(), this.password()).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: () => this.mensaje.set('Correo o contraseña incorrectos')
      });
    } else {
      this.authService.registrar(this.username(), this.email(), this.password()).subscribe({
        next: () => {
          this.mensaje.set('¡Registro éxito! Por favor, inicia sesión.');
          this.esModoLogin.set(true);
        },
        error: (err) => this.mensaje.set(err.error.mensaje || 'Error al registrar')
      });
    }
  }
}
