import {appActions, RequestStatusType} from 'app/app.reducer'
import {AppThunk} from 'app/store';
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


const initialState: TodolistDomainType[] = []

const slice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state.splice(index, 1)
            // return state.filter(tl => tl.id !== action.payload.id)
        },
        changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            const todo = state.find(todo => todo.id === action.payload.id)
            if (todo) {
                todo.title = action.payload.title
            }
        },
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
    }
})

export const todolistsReducer = slice.reducer
export const todolistsActions = slice.actions
export const todolistsThunk = {fetchTodolists, addTodo}


// thunks

export const removeTodolistTC = (id: string): AppThunk => {
    return (dispatch) => {
        //изменим глобальный статус приложения, чтобы вверху полоса побежала
        dispatch(appActions.setAppStatus({status: 'loading'}))
        //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
        dispatch(todolistsActions.changeTodolistEntityStatus({id, entityStatus: 'loading'}))
        todolistsAPI.deleteTodolist(id)
            .then((res) => {
                dispatch(todolistsActions.removeTodolist({id}))
                //скажем глобально приложению, что асинхронная операция завершена
                dispatch(appActions.setAppStatus({status: 'succeeded'}))
            })
    }
}

export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
    return (dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(todolistsActions.changeTodolistTitle({id, title}))
            })
    }
}

// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
