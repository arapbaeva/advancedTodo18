import {appActions, RequestStatusType} from 'app/app.reducer'
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {createAppAsyncThunk, handleServerNetworkError} from "common/utils";
import {todolistsAPI, TodolistType} from "features/TodolistsList/todolists.api";


const fetchTodolists = createAppAsyncThunk<{ todo: TodolistType[] }>('todolists/fetchTodolists', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {

        const res = await todolistsAPI.getTodolists()

        return {todo: res.data}
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const addTodo = createAppAsyncThunk<{ todo: TodolistType }, { title: string }>('todolists/addTodo', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const res = await todolistsAPI.createTodolist(arg.title)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        // dispatch(todolistsActions.addTodolist({todolist: res.data.data.item}))
        return {todo: res.data.data.item}
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})


const changeTodoTitle = createAppAsyncThunk<{todolistId:string, title: string},{todolistId:string, title: string}, any>('todolists/changeTodoTitle', (arg, thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI
    try{
        dispatch(appActions.setAppStatus({status:'loading'}))
        const res = todolistsAPI.updateTodolist( arg.todolistId, arg.title)
        dispatch(appActions.setAppStatus({status:'succeeded'}))
        return arg
    } catch (e){
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const removeTodo = createAppAsyncThunk<any, {todolistId:string}>('todolists/removeTodo', async (arg, thunkAPI)=>{
    const {dispatch, rejectWithValue} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status:'loading'}))
        dispatch(todolistsActions.changeTodolistEntityStatus({id: arg.todolistId, entityStatus: 'loading'}))
        const res = await todolistsAPI.deleteTodolist(arg.todolistId)
        dispatch(appActions.setAppStatus({status: 'succeeded'}))
        return arg
    }catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})

const initialState: TodolistDomainType[] = []

const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.filter = action.payload.filter
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, entityStatus: RequestStatusType }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.entityStatus = action.payload.entityStatus
            }
        }
    },
    extraReducers: builder => {
        builder
            .addCase(clearTasksAndTodolists, () => {
                return []
            })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                return action.payload.todo.map((tl: any) => ({...tl, filter: 'all', entityStatus: 'idle'}))
            })
            .addCase(addTodo.fulfilled, (state, action) => {
                const newTodolist: TodolistDomainType = {...action.payload.todo, filter: 'all', entityStatus: 'idle'}
                state.unshift(newTodolist)
            })
            .addCase(changeTodoTitle.fulfilled, (state, action) => {
                const todo = state.find(todo => todo.id === action.payload.todolistId)
                if (todo) {
                    todo.title = action.payload.title
                }
            })
            .addCase(removeTodo.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
    }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunk = {fetchTodolists, addTodo, changeTodoTitle, removeTodo}




// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
