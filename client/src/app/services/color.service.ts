import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../core/auth.service';
import { SERVER } from './project.service';

export interface PaintColor {
  _id?: string;
  name: string;
  hex: string;
  category: string;
  brand?: string;
}

@Injectable({ providedIn: 'root' })
export class ColorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  list() {
    return this.http.get<PaintColor[]>(`${SERVER}/api/colors`);
  }
  create(c: PaintColor) {
    return this.http.post<PaintColor>(`${SERVER}/api/colors`, c, { headers: this.headers() });
  }
  update(id: string, c: PaintColor) {
    return this.http.put<PaintColor>(`${SERVER}/api/colors/${id}`, c, { headers: this.headers() });
  }
  remove(id: string) {
    return this.http.delete(`${SERVER}/api/colors/${id}`, { headers: this.headers() });
  }

  stats() {
    return this.http.get<any>(`${SERVER}/api/admin/stats`, { headers: this.headers() });
  }
  users() {
    return this.http.get<any[]>(`${SERVER}/api/admin/users`, { headers: this.headers() });
  }
}