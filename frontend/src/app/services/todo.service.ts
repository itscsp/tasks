import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo.model';
import { environment } from '../../environments/environment';

export interface CreateTodoPayload {
  title: string;
}

export interface UpdateTodoPayload {
  title?: string;
  completed?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly apiUrl = `${environment.apiUrl}/todos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  create(payload: CreateTodoPayload): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateTodoPayload): Observable<Todo> {
    return this.http.patch<Todo>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
