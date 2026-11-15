import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService, SavedProject, imgSrc } from '../../services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private api = inject(ProjectService);

  projects = signal<SavedProject[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.api.list().subscribe({
      next: p => { this.projects.set(p); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  remove(id: string) {
    if (!confirm('Do you want to delete this design?')) return;
    this.api.remove(id).subscribe(() => this.load());
  }

  imgUrl(p: SavedProject) {
    return imgSrc(p.resultImageUrl || p.originalImageUrl);
  }

  downloadUrl(p: SavedProject) {
    return imgSrc(p.resultImageUrl || p.originalImageUrl);
  }
}