import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import type { Todo } from './todo.model';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    findAll(): Todo[];
    findOne(id: string): Todo;
    create(dto: CreateTodoDto): Todo;
    update(id: string, dto: UpdateTodoDto): Todo;
    remove(id: string): void;
}
