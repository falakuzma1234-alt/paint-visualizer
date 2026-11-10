import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ColorService, PaintColor } from '../../services/color.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {
  private api = inject(ColorService);

  tab = signal<'stats' | 'colors' | 'users'>('stats');
  stats = signal<any>(null);
  colors = signal<PaintColor[]>([]);
  users = signal<any[]>([]);
  error = signal('');

  form: PaintColor = { name: '', hex: '#6FA8DC', category: 'Blues', brand: '' };
  editingId: string | null = null;

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.api.stats().subscribe({
      next: s => this.stats.set(s),
      error: () => this.error.set('You do not have admin access'),
    });
    this.api.list().subscribe(c => this.colors.set(c));
    this.api.users().subscribe({ next: u => this.users.set(u), error: () => {} });
  }

  save() {
    this.error.set('');
    if (!this.form.name.trim()) { this.error.set('Please enter a name.'); return; }

    const req = this.editingId
      ? this.api.update(this.editingId, this.form)
      : this.api.create(this.form);

    req.subscribe({
      next: () => { this.reset(); this.loadAll(); },
      error: e => this.error.set(e.error?.message || 'Could not save'),
    });
  }

  edit(c: PaintColor) {
    this.form = { ...c };
    this.editingId = c._id!;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  remove(id: string) {
    if (!confirm('Do you want to delete this color?')) return;
    this.api.remove(id).subscribe(() => this.loadAll());
  }

  reset() {
    this.form = { name: '', hex: '#6FA8DC', category: 'Blues', brand: '' };
    this.editingId = null;
  }
}