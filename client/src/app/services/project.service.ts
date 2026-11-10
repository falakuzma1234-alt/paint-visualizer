import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';

export const SERVER = 'http://localhost:5000';

export interface SavedProject {
  _id: string;
  title: string;
  originalImageUrl: string;
  resultImageUrl?: string;
  walls: { polygon: { x: number; y: number }[]; color: string; opacity: number }[];
  canvasWidth?: number;
  canvasHeight?: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  list() {
    return this.http.get<SavedProject[]>(`${SERVER}/api/projects`, { headers: this.headers() });
  }

  create(form: FormData) {
    return this.http.post<SavedProject>(`${SERVER}/api/projects`, form, { headers: this.headers() });
  }

  remove(id: string) {
    return this.http.delete(`${SERVER}/api/projects/${id}`, { headers: this.headers() });
  }
    get(id: string) {
    return this.http.get<SavedProject>(`${SERVER}/api/projects/${id}`, { headers: this.headers() });
  }

  update(id: string, form: FormData) {
    return this.http.put<SavedProject>(`${SERVER}/api/projects/${id}`, form, { headers: this.headers() });
  }
}