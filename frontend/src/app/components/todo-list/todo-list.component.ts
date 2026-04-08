import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { TodoFormComponent } from '../todo-form/todo-form.component';

type FilterType = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent, TodoFormComponent],
  template: `
    <div class="list-container">
      <!-- Header -->
      <div class="list-header">
        <h1 class="list-title">
          <span class="title-icon">✦</span>
          My Tasks
        </h1>
        <div class="stats">
          <span class="stat-chip">
            <span class="stat-num">{{ activeCount() }}</span> remaining
          </span>
        </div>
      </div>

      <!-- Form -->
      <app-todo-form (addTodo)="onAdd($event)" />

      <!-- Filters -->
      <div class="filters" role="group" aria-label="Filter todos">
        @for (f of filters; track f.value) {
          <button
            class="filter-btn"
            [class.active]="filter() === f.value"
            (click)="filter.set(f.value)"
            [id]="'filter-' + f.value"
          >
            {{ f.label }}
          </button>
        }
        @if (completedCount() > 0) {
          <button class="filter-btn clear-btn" (click)="clearCompleted()" id="clear-completed-btn">
            Clear done ({{ completedCount() }})
          </button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading tasks...</span>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error-banner" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ error() }}
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && filteredTodos().length === 0 && !error()) {
        <div class="empty-state">
          <div class="empty-icon">
            @if (filter() === 'completed') { 🎯 }
            @else if (filter() === 'active') { 🎉 }
            @else { 📝 }
          </div>
          <p class="empty-text">
            @if (filter() === 'completed') { No completed tasks yet }
            @else if (filter() === 'active') { All caught up! }
            @else { Add your first task above }
          </p>
        </div>
      }

      <!-- Todo List -->
      <div class="todos-list" role="list">
        @for (todo of filteredTodos(); track todo.id) {
          <app-todo-item
            [todo]="todo"
            (toggle)="onToggle($event)"
            (edit)="onEdit($event)"
            (delete)="onDelete($event)"
            role="listitem"
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }

    .list-title {
      font-size: 1.9rem;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .title-icon {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 1.4rem;
    }

    .stats {
      display: flex;
      gap: 8px;
    }

    .stat-chip {
      background: rgba(139,92,246,0.15);
      border: 1px solid rgba(139,92,246,0.25);
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 0.82rem;
      color: rgba(139,92,246,0.9);
      font-weight: 500;
    }

    .stat-num {
      font-weight: 700;
      font-size: 0.9rem;
    }

    .filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-btn {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 7px 16px;
      font-size: 0.82rem;
      font-weight: 500;
      color: rgba(255,255,255,0.55);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .filter-btn:hover {
      background: rgba(255,255,255,0.09);
      color: rgba(255,255,255,0.8);
    }

    .filter-btn.active {
      background: rgba(139,92,246,0.2);
      border-color: rgba(139,92,246,0.45);
      color: #c4b5fd;
    }

    .clear-btn {
      margin-left: auto;
      color: rgba(248,113,113,0.7);
      border-color: rgba(248,113,113,0.2);
      background: rgba(248,113,113,0.06);
    }

    .clear-btn:hover {
      color: #f87171;
      background: rgba(248,113,113,0.12);
      border-color: rgba(248,113,113,0.35);
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 40px;
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
    }

    .spinner {
      width: 22px;
      height: 22px;
      border: 2px solid rgba(139,92,246,0.2);
      border-top-color: #8b5cf6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 12px;
      padding: 12px 16px;
      color: #f87171;
      font-size: 0.88rem;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 50px 20px;
    }

    .empty-icon {
      font-size: 2.5rem;
    }

    .empty-text {
      color: rgba(255,255,255,0.35);
      font-size: 0.9rem;
      margin: 0;
    }

    .todos-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `],
})
export class TodoListComponent implements OnInit {
  todos = signal<Todo[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  filter = signal<FilterType>('all');

  filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  filteredTodos = computed(() => {
    const f = this.filter();
    const todos = this.todos();
    if (f === 'active') return todos.filter((t) => !t.completed);
    if (f === 'completed') return todos.filter((t) => t.completed);
    return todos;
  });

  activeCount = computed(() => this.todos().filter((t) => !t.completed).length);
  completedCount = computed(() => this.todos().filter((t) => t.completed).length);

  constructor(private todoService: TodoService) {}

  ngOnInit() {
    this.loadTodos();
  }

  loadTodos() {
    this.loading.set(true);
    this.error.set(null);
    this.todoService.getAll().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to connect to API. Is the backend running on port 3000?');
        this.loading.set(false);
      },
    });
  }

  onAdd(title: string) {
    this.todoService.create({ title }).subscribe({
      next: (todo) => this.todos.update((todos) => [todo, ...todos]),
      error: () => this.error.set('Failed to create task.'),
    });
  }

  onToggle(id: string) {
    const todo = this.todos().find((t) => t.id === id);
    if (!todo) return;
    this.todoService.update(id, { completed: !todo.completed }).subscribe({
      next: (updated) =>
        this.todos.update((todos) => todos.map((t) => (t.id === id ? updated : t))),
      error: () => this.error.set('Failed to update task.'),
    });
  }

  onEdit({ id, title }: { id: string; title: string }) {
    this.todoService.update(id, { title }).subscribe({
      next: (updated) =>
        this.todos.update((todos) => todos.map((t) => (t.id === id ? updated : t))),
      error: () => this.error.set('Failed to update task.'),
    });
  }

  onDelete(id: string) {
    this.todoService.delete(id).subscribe({
      next: () => this.todos.update((todos) => todos.filter((t) => t.id !== id)),
      error: () => this.error.set('Failed to delete task.'),
    });
  }

  clearCompleted() {
    const completed = this.todos().filter((t) => t.completed);
    completed.forEach(({ id }) => {
      this.todoService.delete(id).subscribe({
        next: () => this.todos.update((todos) => todos.filter((t) => t.id !== id)),
      });
    });
  }
}
