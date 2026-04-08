import {
  Component,
  Output,
  EventEmitter,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todo-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form class="todo-form" (ngSubmit)="onSubmit()">
      <div class="input-group">
        <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <input
          id="new-todo-input"
          type="text"
          class="todo-input"
          placeholder="Add a new task..."
          [(ngModel)]="title"
          name="title"
          autocomplete="off"
          maxlength="200"
        />
        <button
          type="submit"
          class="add-btn"
          [disabled]="!title().trim()"
          id="add-todo-btn"
        >
          Add
        </button>
      </div>
    </form>
  `,
  styles: [`
    .todo-form {
      width: 100%;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px;
      padding: 6px 6px 6px 18px;
      transition: all 0.25s ease;
    }

    .input-group:focus-within {
      border-color: rgba(139,92,246,0.6);
      background: rgba(255,255,255,0.09);
      box-shadow: 0 0 0 4px rgba(139,92,246,0.12);
    }

    .input-icon {
      width: 18px;
      height: 18px;
      color: rgba(139,92,246,0.6);
      flex-shrink: 0;
      margin-right: 10px;
    }

    .todo-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      font-size: 0.97rem;
      color: rgba(255,255,255,0.9);
      font-family: inherit;
    }

    .todo-input::placeholder {
      color: rgba(255,255,255,0.3);
    }

    .add-btn {
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      border: none;
      border-radius: 11px;
      padding: 10px 22px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      letter-spacing: 0.02em;
      font-family: inherit;
    }

    .add-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(139,92,246,0.5);
    }

    .add-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .add-btn:active:not(:disabled) {
      transform: translateY(0);
    }
  `],
})
export class TodoFormComponent {
  @Output() addTodo = new EventEmitter<string>();

  title = signal('');

  onSubmit() {
    const trimmed = this.title().trim();
    if (trimmed) {
      this.addTodo.emit(trimmed);
      this.title.set('');
    }
  }
}
