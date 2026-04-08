import { Component } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent],
  template: `
    <div class="app-shell">
      <!-- Background decoration -->
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
      <div class="bg-blob blob-3"></div>

      <main class="main-content">
        <div class="card">
          <app-todo-list />
        </div>
      </main>

      <footer class="footer">
        <span>Built with Angular & NestJS</span>
      </footer>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding: 60px 16px 40px;
      position: relative;
      overflow: hidden;
    }

    /* Animated background blobs */
    .bg-blob {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.18;
      pointer-events: none;
      z-index: 0;
    }

    .blob-1 {
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, #8b5cf6, #6366f1);
      top: -150px;
      left: -100px;
      animation: float1 12s ease-in-out infinite;
    }

    .blob-2 {
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, #3b82f6, #0ea5e9);
      bottom: -100px;
      right: -80px;
      animation: float2 15s ease-in-out infinite;
    }

    .blob-3 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, #ec4899, #a855f7);
      top: 40%;
      left: 60%;
      animation: float3 10s ease-in-out infinite;
    }

    @keyframes float1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(30px, 40px) scale(1.05); }
    }
    @keyframes float2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-20px, -30px) scale(1.08); }
    }
    @keyframes float3 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(-40px, 20px) scale(0.95); }
    }

    .main-content {
      width: 100%;
      max-width: 660px;
      position: relative;
      z-index: 1;
    }

    .card {
      background: rgba(15, 13, 28, 0.75);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 36px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.05) inset,
        0 32px 80px rgba(0,0,0,0.5),
        0 8px 24px rgba(139,92,246,0.08);
    }

    .footer {
      margin-top: 28px;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.2);
      position: relative;
      z-index: 1;
      letter-spacing: 0.03em;
    }
  `],
})
export class App {}
