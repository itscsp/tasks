import { Todo } from './todo.model';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
export declare class TodosService {
    private todos;
    findAll(): Todo[];
    findOne(id: string): Todo;
    create(dto: CreateTodoDto): Todo;
    update(id: string, dto: UpdateTodoDto): Todo;
    remove(id: string): void;
}
