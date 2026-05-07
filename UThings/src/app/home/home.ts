import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SesionService } from '../sesion.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private api = inject(SesionService);
  private router = inject(Router);

  apodo = signal(this.api.usuarioLogueado() || 'Invitado');
  email = signal(this.api.emailLogueado() || '');
  misNotas = signal<any[]>([]);

  mostrarModal = signal(false);
  notaSeleccionada = signal<any>(null);
  nuevoColaboradorEmail = signal('');
  nuevoColaboradorPermiso = signal<'lectura' | 'edicion'>('lectura');

  ngOnInit() {
    if (!this.email()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cargarBiblioteca();
  }

  cargarBiblioteca() {
    this.api.obtenerNotas(this.email()).subscribe({
      next: (notas) => {
        this.misNotas.set(notas);
        if (this.notaSeleccionada()) {
          const actualizada = notas.find(n => n.id === this.notaSeleccionada().id);
          if (actualizada) this.notaSeleccionada.set(actualizada);
        }
      }
    });
  }

  crearNuevaNota() {
    this.api.crearNota(this.email()).subscribe({
      next: (nuevaNota) => this.router.navigate(['/editor', nuevaNota.id]),
      error: () => alert('Error')
    });
  }

  abrirModalCompartir(event: Event, nota: any) {
    event.stopPropagation();
    this.notaSeleccionada.set(nota);
    this.nuevoColaboradorEmail.set('');
    this.nuevoColaboradorPermiso.set('lectura');
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
    this.notaSeleccionada.set(null);
  }

  actualizarAcceso(emailDestino: string, permiso: 'lectura' | 'edicion') {
    this.api.compartirNota(this.notaSeleccionada().id, emailDestino, permiso).subscribe({
      next: () => this.cargarBiblioteca()
    });
  }

  confirmarCompartir() {
    const emailDestino = this.nuevoColaboradorEmail().toLowerCase().trim();
    if (!emailDestino || emailDestino === this.email().toLowerCase()) return;
    this.actualizarAcceso(emailDestino, this.nuevoColaboradorPermiso());
    this.nuevoColaboradorEmail.set('');
  }

  cerrarSesion() {
    this.api.cerrarSesion();
    this.router.navigate(['/login']);
  }

  abrirNota(id: string) {
    this.router.navigate(['/editor', id]);
  }

  borrarNota(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('¿Borrar nota?')) {
      this.api.eliminarNota(id).subscribe({
        next: () => this.cargarBiblioteca()
      });
    }
  }
}
