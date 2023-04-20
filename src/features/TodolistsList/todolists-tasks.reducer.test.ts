import {
	TodolistDomainType,
	todolistsActions,
	todolistsReducer,
	todolistsThunk
} from 'features/TodolistsList/todolists.reducer'
import { tasksReducer, TasksStateType } from 'features/TodolistsList/tasks.reducer'
import {TodolistType} from "features/TodolistsList/todolists.api";


test('ids should be equals', () => {
	const startTasksState: TasksStateType = {};
	const startTodolistsState: Array<TodolistDomainType> = [];

	let todo: TodolistType = {
		title: 'new todolist',
		id: 'any id',
		addedDate: '',
		order: 0
	}

	const action = todolistsThunk.addTodo.fulfilled({todo}, '', {title:'new todolist' });

	const endTasksState = tasksReducer(startTasksState, action)
	const endTodolistsState = todolistsReducer(startTodolistsState, action)

	const keys = Object.keys(endTasksState);
	const idFromTasks = keys[0];
	const idFromTodolists = endTodolistsState[0].id;

	expect(idFromTasks).toBe(action.payload.todo.id);
	expect(idFromTodolists).toBe(action.payload.todo.id);
});
