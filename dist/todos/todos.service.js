"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodosService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let TodosService = class TodosService {
    todos = [];
    findAll() {
        return this.todos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    findOne(id) {
        const todo = this.todos.find((t) => t.id === id);
        if (!todo)
            throw new common_1.NotFoundException(`Todo #${id} not found`);
        return todo;
    }
    create(dto) {
        const todo = {
            id: (0, crypto_1.randomUUID)(),
            title: dto.title.trim(),
            completed: false,
            createdAt: new Date(),
        };
        this.todos.push(todo);
        return todo;
    }
    update(id, dto) {
        const todo = this.findOne(id);
        if (dto.title !== undefined)
            todo.title = dto.title.trim();
        if (dto.completed !== undefined)
            todo.completed = dto.completed;
        return todo;
    }
    remove(id) {
        const index = this.todos.findIndex((t) => t.id === id);
        if (index === -1)
            throw new common_1.NotFoundException(`Todo #${id} not found`);
        this.todos.splice(index, 1);
    }
};
exports.TodosService = TodosService;
exports.TodosService = TodosService = __decorate([
    (0, common_1.Injectable)()
], TodosService);
//# sourceMappingURL=todos.service.js.map