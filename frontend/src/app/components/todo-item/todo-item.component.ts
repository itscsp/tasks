import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="todo-item" [class.completed]="todo.completed" [class.editing]="editing()">
      <div class="todo-main">
        <button
          class="check-btn"
          [class.checked]="todo.completed"
          (click)="onToggle()"
          [attr.aria-label]="todo.completed ? 'Mark incomplete' : 'Mark complete'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>

        @if (editing()) {
          <input
            class="edit-input"
            [(ngModel)]="editValue"
            (keyup.enter)="saveEdit()"
            (keyup.escape)="cancelEdit()"
            #editInput
            autofocus
          />
        } @else {
          <span class="todo-title" (dblclick)="startEdit()">{{ todo.title }}</span>
        }
      </div>

      <div class="todo-actions">
        @if (editing()) {
          <button class="action-btn save-btn" (click)="saveEdit()" title="Save">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <button class="action-btn cancel-btn" (click)="cancelEdit()" title="Cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        } @else {
          <button class="action-btn edit-btn" (click)="startEdit()" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="action-btn delete-btn" (click)="onDelete()" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
              <path d="M10 11v6M14 11v6"></path>
            </svg>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .todo-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      transition: all 0.25s ease;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0);     }
    }

    .todo-item:hover {
      background: rgba(255,255,255,0.07);
      border-color: rgba(139,92,246,0.3);
      transform: translateX(2px);
    }

    .todo-item.completed .todo-title {
      text-decoration: line-through;
      color: rgba(255,255,255,0.3);
    }

    .todo-main {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .check-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,0.2);
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.2s ease;
      color: transparent;
    }

    .check-btn:hover {
      border-color: #8b5cf6;
      background: rgba(139,92,246,0.1);
    }

    .check-btn.checked {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      border-color: transparent;
      color: white;
    }

    .check-btn svg {
      width: 13px;
      height: 13px;
    }

    .todo-title {
      font-size: 0.95rem;
      color: rgba(255,255,255,0.85);
      flex: 1;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s;
    }

    .edit-input {
      flex: 1;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(139,92,246,0.5);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 0.95rem;
      color: white;
      outline: none;
      box-shadow: 0 0 0 3px rgba(139,92,246,0.15);
    }

    .todo-actions {
      display: flex;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .todo-item:hover .todo-actions,
    .todo-item.editing .todo-actions {
      opacity: 1;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-btn svg {
      width: 15px;
      height: 15px;
    }

    .edit-btn {
      background: rgba(99,102,241,0.15);
      color: #818cf8;
    }
    .edit-btn:hover { background: rgba(99,102,241,0.3); }

    .delete-btn {
      background: rgba(239,68,68,0.12);
      color: #f87171;
    }
    .delete-btn:hover { background: rgba(239,68,68,0.25); }

    .save-btn {
      background: rgba(34,197,94,0.15);
      color: #4ade80;
    }
    .save-btn:hover { background: rgba(34,197,94,0.3); }

    .cancel-btn {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.5);
    }
    .cancel-btn:hover { background: rgba(255,255,255,0.15); }
  `],
})
export class TodoItemComponent {
  @Input() todo!: Todo;
  @Output() toggle = new EventEmitter<string>();
  @Output() edit = new EventEmitter<{ id: string; title: string }>();
  @Output() delete = new EventEmitter<string>();

  editing = signal(false);
  editValue = '';

  startEdit() {
    this.editValue = this.todo.title;
    this.editing.set(true);
  }

  saveEdit() {
    const trimmed = this.editValue.trim();
    if (trimmed && trimmed !== this.todo.title) {
      this.edit.emit({ id: this.todo.id, title: trimmed });
    }
    this.editing.set(false);
  }

  cancelEdit() {
    this.editing.set(false);
  }

  onToggle() {
    this.toggle.emit(this.todo.id);
  }

  onDelete() {
    this.delete.emit(this.todo.id);
  }
}
