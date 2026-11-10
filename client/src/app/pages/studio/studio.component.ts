import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ProjectService, SERVER } from '../../services/project.service';
import { ColorService } from '../../services/color.service';

interface Point { x: number; y: number; }
interface Wall { polygon: Point[]; color: string; opacity: number; }

@Component({
  selector: 'app-studio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './studio.component.html',
  styleUrl: './studio.component.scss',
})
export class StudioComponent implements OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private auth = inject(AuthService);
  private projects = inject(ProjectService);
  private colorApi = inject(ColorService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private ctx!: CanvasRenderingContext2D;
  private img: HTMLImageElement | null = null;
  private readonly MAX_WIDTH = 1600;
  private originalFile: File | null = null;
  private dragging = false;

  hasImage = false;
  walls: Wall[] = [];
  currentPoints: Point[] = [];
  activeIndex = -1;
  color = '#6FA8DC';
  opacity = 0.6;
  showBefore = false;

  compareMode = false;
  splitX = 0.5;

  saving = false;
  saveMsg = '';
  editingId: string | null = null;

  colors: { name: string; hex: string; category: string }[] = [];
  selectedCategory = 'All';
  categories: string[] = ['All'];

  get filteredColors() {
    return this.selectedCategory === 'All'
      ? this.colors
      : this.colors.filter(c => c.category === this.selectedCategory);
  }

  // ---------- Init ----------
  ngOnInit() {
    this.colorApi.list().subscribe({
      next: list => {
        this.colors = list;
        const cats = Array.from(new Set(list.map(c => c.category)));
        this.categories = ['All', ...cats];
      },
      error: () => console.error('Could not load colours. Is the backend running?'),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProject(id);
  }

  private loadProject(id: string) {
    this.projects.get(id).subscribe({
      next: p => {
        this.editingId = p._id;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          this.img = img;
          this.hasImage = true;
          this.walls = p.walls.map(w => ({
            polygon: w.polygon.map(pt => ({ x: pt.x, y: pt.y })),
            color: w.color,
            opacity: w.opacity,
          }));
          this.activeIndex = this.walls.length ? 0 : -1;
          if (this.walls.length) {
            this.color = this.walls[0].color;
            this.opacity = this.walls[0].opacity;
          }
          setTimeout(() => {
            this.setupCanvas(img);
            this.redraw();
          });
        };
        img.src = SERVER + p.originalImageUrl;
      },
      error: () => {
        alert('Could not load the project.');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  // ---------- Upload ----------
  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload a JPG or PNG image only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.');
      return;
    }

    this.originalFile = file;
    this.editingId = null;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        this.img = img;
        this.hasImage = true;
        this.walls = [];
        this.currentPoints = [];
        this.activeIndex = -1;
        this.compareMode = false;
        this.saveMsg = '';
        setTimeout(() => {
          this.setupCanvas(img);
          this.redraw();
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  private setupCanvas(img: HTMLImageElement) {
    const canvas = this.canvasRef.nativeElement;
    const scale = img.width > this.MAX_WIDTH ? this.MAX_WIDTH / img.width : 1;
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    this.ctx = canvas.getContext('2d')!;
  }

  // ---------- Wall selection ----------
  onCanvasClick(e: MouseEvent) {
    if (!this.hasImage || this.compareMode) return;
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (this.currentPoints.length >= 3) {
      const first = this.currentPoints[0];
      if (Math.hypot(first.x - x, first.y - y) < 15) {
        this.finishWall();
        return;
      }
    }

    this.currentPoints.push({ x, y });
    this.redraw();
  }

  finishWall() {
    if (this.currentPoints.length < 3) return;
    this.walls.push({
      polygon: [...this.currentPoints],
      color: this.color,
      opacity: this.opacity,
    });
    this.activeIndex = this.walls.length - 1;
    this.currentPoints = [];
    this.redraw();
  }

  undoPoint() {
    this.currentPoints.pop();
    this.redraw();
  }

  undoWall() {
    this.walls.pop();
    this.activeIndex = this.walls.length - 1;
    this.redraw();
  }

  selectWall(i: number) {
    this.activeIndex = i;
    this.color = this.walls[i].color;
    this.opacity = this.walls[i].opacity;
    this.redraw();
  }

  deleteWall(i: number) {
    this.walls.splice(i, 1);
    this.activeIndex = this.walls.length - 1;
    if (!this.walls.length) this.compareMode = false;
    this.redraw();
  }

  // ---------- Colour / opacity ----------
  pickColor(hex: string) {
    this.color = hex;
    this.applyToActive();
  }

  applyToActive() {
    const active = this.walls[this.activeIndex];
    if (active) {
      active.color = this.color;
      active.opacity = this.opacity;
    }
    this.redraw();
  }

  // ---------- Drawing ----------
  redraw() {
    if (!this.img || !this.ctx) return;
    const c = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, c.width, c.height);
    this.ctx.drawImage(this.img, 0, 0, c.width, c.height);

    if (this.showBefore) return;

    this.walls.forEach(w => this.paintWall(w));

    if (this.compareMode) {
      const sx = c.width * this.splitX;
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, sx, c.height);
      this.ctx.clip();
      this.ctx.drawImage(this.img, 0, 0, c.width, c.height);
      this.ctx.restore();
      this.drawSplitLine(sx);
    } else {
      this.drawActiveOutline();
      this.drawSelection();
    }
  }

  private tracePath(points: Point[]) {
    this.ctx.beginPath();
    points.forEach((p, i) =>
      i === 0 ? this.ctx.moveTo(p.x, p.y) : this.ctx.lineTo(p.x, p.y)
    );
    this.ctx.closePath();
  }

  private paintWall(wall: Wall) {
    const c = this.canvasRef.nativeElement;
    this.ctx.save();
    this.tracePath(wall.polygon);
    this.ctx.clip();
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.globalAlpha = wall.opacity;
    this.ctx.fillStyle = wall.color;
    this.ctx.fillRect(0, 0, c.width, c.height);
    this.ctx.restore();
  }

  private drawActiveOutline() {
    const w = this.walls[this.activeIndex];
    if (!w) return;
    this.ctx.save();
    this.tracePath(w.polygon);
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([8, 5]);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawSplitLine(sx: number) {
    const c = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    ctx.save();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx, c.height);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx, c.height / 2, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('↔', sx, c.height / 2);

    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(10, 10, 62, 24);
    ctx.fillRect(c.width - 72, 10, 62, 24);
    ctx.fillStyle = '#fff';
    ctx.fillText('BEFORE', 41, 22);
    ctx.fillText('AFTER', c.width - 41, 22);

    ctx.restore();
  }

  private drawSelection() {
    const pts = this.currentPoints;
    if (!pts.length) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.strokeStyle = '#ff3b30';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    ctx.setLineDash([]);

    pts.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? '#34c759' : '#ff3b30';
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // ---------- Before / After slider ----------
  toggleCompare() {
    this.compareMode = !this.compareMode;
    this.currentPoints = [];
    this.redraw();
  }

  private canvasX(e: MouseEvent): number {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    return (e.clientX - rect.left) * (canvas.width / rect.width);
  }

  onMouseDown(e: MouseEvent) {
    if (!this.compareMode) return;
    this.dragging = true;
    this.updateSplit(e);
  }

  onMouseMove(e: MouseEvent) {
    if (this.compareMode && this.dragging) this.updateSplit(e);
  }

  onMouseUp() {
    this.dragging = false;
  }

  private updateSplit(e: MouseEvent) {
    const c = this.canvasRef.nativeElement;
    this.splitX = Math.min(1, Math.max(0, this.canvasX(e) / c.width));
    this.redraw();
  }

  onTouchStart(e: TouchEvent) {
    if (!this.compareMode) return;
    this.dragging = true;
    this.updateSplitTouch(e);
  }

  onTouchMove(e: TouchEvent) {
    if (this.compareMode && this.dragging) {
      e.preventDefault();
      this.updateSplitTouch(e);
    }
  }

  private updateSplitTouch(e: TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    const c = this.canvasRef.nativeElement;
    const rect = c.getBoundingClientRect();
    const x = (t.clientX - rect.left) * (c.width / rect.width);
    this.splitX = Math.min(1, Math.max(0, x / c.width));
    this.redraw();
  }

  // ---------- Download ----------
  download() {
    const prevBefore = this.showBefore;
    const savedCompare = this.compareMode;
    const savedPoints = this.currentPoints;
    const savedActive = this.activeIndex;

    this.showBefore = false;
    this.compareMode = false;
    this.currentPoints = [];
    this.activeIndex = -1;
    this.redraw();

    this.canvasRef.nativeElement.toBlob(blob => {
      if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-painted-room.png';
        a.click();
        URL.revokeObjectURL(a.href);
      }
      this.showBefore = prevBefore;
      this.compareMode = savedCompare;
      this.currentPoints = savedPoints;
      this.activeIndex = savedActive;
      this.redraw();
    }, 'image/png');
  }

  // ---------- Save / Update ----------
  save() {
    if (!this.auth.isLoggedIn) {
      alert('Please log in to save your design.');
      this.router.navigate(['/login']);
      return;
    }
    if (!this.walls.length) return;
    if (!this.editingId && !this.originalFile) return;

    const prevCompare = this.compareMode;
    const prevPoints = this.currentPoints;
    const prevActive = this.activeIndex;
    this.compareMode = false;
    this.currentPoints = [];
    this.activeIndex = -1;
    this.redraw();

    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob(blob => {
      this.compareMode = prevCompare;
      this.currentPoints = prevPoints;
      this.activeIndex = prevActive;
      this.redraw();
      if (!blob) return;

      const form = new FormData();
      form.append('result', blob, 'result.png');
      form.append('walls', JSON.stringify(this.walls));

      this.saving = true;
      this.saveMsg = '';

      let req;
      if (this.editingId) {
        req = this.projects.update(this.editingId, form);
      } else {
        form.append('original', this.originalFile!);
        form.append('canvasWidth', String(canvas.width));
        form.append('canvasHeight', String(canvas.height));
        form.append('title', 'Room ' + new Date().toLocaleDateString());
        req = this.projects.create(form);
      }

      req.subscribe({
        next: p => {
          this.saving = false;
          this.editingId = p._id;
          this.saveMsg = 'Saved successfully! ✅';
        },
        error: err => {
          this.saving = false;
          this.saveMsg = err.error?.message || 'Could not save. Is the backend running?';
        },
      });
    }, 'image/png');
  }
}