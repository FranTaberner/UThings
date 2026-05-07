import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SesionService } from '../sesion.service';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notas.html',
  styleUrl: './notas.css'
})
export class Notas implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(SesionService);

  idNota = signal('');
  titulo = signal('');
  texto = signal('');
  estadoGuardado = signal('Guardado');
  puedeEditar = signal(true);

  autorOriginal = signal('');
  colaboradoresActuales = signal<any[]>([]);
  mostrarModal = signal(false);
  nuevoColaboradorEmail = signal('');
  nuevoColaboradorPermiso = signal<'lectura' | 'edicion'>('lectura');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const email = this.api.emailLogueado() || localStorage.getItem('email');
    if (!email) { this.router.navigate(['/login']); return; }
    if (id) {
      this.idNota.set(id);
      this.cargarContenidoNota(id, email);
    }
  }

  cargarContenidoNota(id: string, email: string) {
    this.api.obtenerNotas(email).subscribe({
      next: (notas) => {
        const nota = notas.find(n => String(n.id).trim() === String(id).trim());
        if (nota) {
          this.titulo.set(nota.titulo || '');
          this.texto.set(nota.contenido || '');
          this.autorOriginal.set(nota.autorEmail);
          this.colaboradoresActuales.set(nota.colaboradores || []);

          const emailUser = email.toLowerCase();
          const esAutor = nota.autorEmail.toLowerCase() === emailUser;
          const colab = nota.colaboradores?.find((c: any) => c.email.toLowerCase() === emailUser);
          const esEditor = colab && colab.permiso === 'edicion';
          this.puedeEditar.set(esAutor || esEditor);
          if (!this.puedeEditar()) this.estadoGuardado.set('Modo Solo Lectura');
        }
      }
    });
  }

  guardar() {
    if (!this.idNota() || !this.puedeEditar()) return;
    this.estadoGuardado.set('Guardando...');
    this.api.actualizarNota(this.idNota(), this.titulo(), this.texto()).subscribe({
      next: () => this.estadoGuardado.set('Guardado'),
      error: () => this.estadoGuardado.set('Error al guardar')
    });
  }

  abrirModal() {
    this.mostrarModal.set(true);
  }

  cerrarModal() {
    this.mostrarModal.set(false);
  }

  actualizarAcceso(emailDestino: string, permiso: 'lectura' | 'edicion') {
    this.api.compartirNota(this.idNota(), emailDestino, permiso).subscribe({
      next: () => {
        const emailLogueado = this.api.emailLogueado() || '';
        this.cargarContenidoNota(this.idNota(), emailLogueado);
      }
    });
  }

  confirmarCompartir() {
    const emailDestino = this.nuevoColaboradorEmail().toLowerCase().trim();
    if (!emailDestino || emailDestino === this.api.emailLogueado()) return;
    this.actualizarAcceso(emailDestino, this.nuevoColaboradorPermiso());
    this.nuevoColaboradorEmail.set('');
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
