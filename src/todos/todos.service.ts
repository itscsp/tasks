import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Todo } from './todo.model';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodosService {
  private todos: Todo[] = [];

  findAll(): Todo[] {
    return this.todos.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findOne(id: string): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new NotFoundException(`Todo #${id} not found`);
    return todo;
  }

  create(dto: CreateTodoDto): Todo {
    const todo: Todo = {
      id: randomUUID(),
      title: dto.title.trim(),
      completed: false,
      createdAt: new Date(),
    };
    this.todos.push(todo);
    return todo;
  }

  update(id: string, dto: UpdateTodoDto): Todo {
    const todo = this.findOne(id);
    if (dto.title !== undefined) todo.title = dto.title.trim();
    if (dto.completed !== undefined) todo.completed = dto.completed;
    return todo;
  }

  remove(id: string): void {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) throw new NotFoundException(`Todo #${id} not found`);
    this.todos.splice(index, 1);
  }
}
