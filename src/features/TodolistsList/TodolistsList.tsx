import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {
    FilterValuesType,
    todolistsActions, todolistsThunk
} from 'features/TodolistsList/todolists.reducer'
import {tasksThunks} from 'features/TodolistsList/tasks.reducer'
import {Grid, Paper} from '@mui/material'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'common/hooks/useAppDispatch';
import {selectIsLoggedIn} from 'features/auth/auth.selectors';
import {selectTasks} from 'features/TodolistsList/tasks.selectors';
import {selectTodolists} from 'features/TodolistsList/todolists.selectors';
import {AddItemForm} from "common/components";
import {TaskStatuses} from "common/enums";


type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector(selectTodolists)
    const tasks = useSelector(selectTasks)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        const thunk = todolistsThunk.fetchTodolists()
        dispatch(thunk)
    }, [])

    const removeTask = useCallback(function (taskId: string, todolistId: string) {
       dispatch(tasksThunks.removeTask({taskId, todolistId}))

    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        const thunk = tasksThunks.addTask({title, todolistId})
        dispatch(thunk)
    }, [])

    const changeStatus = useCallback(function (taskId: string, status: TaskStatuses, todolistId: string) {
        dispatch(tasksThunks.updateTask({taskId, domainModel: {status}, todolistId}))

    }, [])

    const changeTaskTitle = useCallback(function (taskId: string, newTitle: string, todolistId: string) {
        dispatch(tasksThunks.updateTask({taskId, domainModel: {title: newTitle}, todolistId}))
    }, [])

    const changeFilter = useCallback(function (filter: FilterValuesType, id: string) {
        dispatch(todolistsActions.changeTodolistFilter({id, filter}))
    }, [])

    const removeTodolist = useCallback(function (todolistId: string) {
        const thunk = todolistsThunk.removeTodo({todolistId})
        dispatch(thunk)
    }, [])

    const changeTodolistTitle = useCallback(function (todolistId: string, title: string) {
        const thunk = todolistsThunk.changeTodoTitle({todolistId, title})
        dispatch(thunk)
    }, [])

    const addTodolist = useCallback((title: string) => {
        const thunk = todolistsThunk.addTodo({title})
        dispatch(thunk)
    }, [dispatch])

    if (!isLoggedIn) {
        return <Navigate to={'/login'}/>
    }

    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolist}/>
        </Grid>
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
