import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private readonly http = inject(HttpClient);
  private readonly urlLogin = 'http://localhost:3000';
  private readonly urlNotas = 'http://localhost:3001';

  usuarioLogueado = signal<string | null>(localStorage.getItem('usuario'));
  emailLogueado = signal<string | null>(localStorage.getItem('email'));

  // --- AUTENTICACIÓN ---

  registrar(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.urlLogin}/register`, { username, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.urlLogin}/login`, { email, password }).pipe(
      tap((res: any) => {
        this.usuarioLogueado.set(res.username);
        this.emailLogueado.set(res.email);
        localStorage.setItem('usuario', res.username);
        localStorage.setItem('email', res.email);
      })
    );
  }

  cerrarSesion() {
    this.usuarioLogueado.set(null);
    this.emailLogueado.set(null);
    localStorage.clear();
  }


  // --- NOTAS ---

  obtenerNotas(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlNotas}/notas/${email}`);
  }

  crearNota(email: string): Observable<any> {
    return this.http.post(`${this.urlNotas}/notas/crear`, { email });
  }

  actualizarNota(id: string, titulo: string, contenido: string): Observable<any> {
    const email = this.emailLogueado();
    return this.http.put(`${this.urlNotas}/notas/${id}`, {
      titulo,
      contenido,
      email
    });
  }

  compartirNota(id: string, emailACompartir: string, permiso: 'lectura' | 'edicion'): Observable<any> {
    return this.http.post(`${this.urlNotas}/notas/compartir`, {
      id,
      emailACompartir,
      permiso
    });
  }

  eliminarNota(id: string): Observable<any> {
    return this.http.delete(`${this.urlNotas}/notas/${id}`);
  }
}
