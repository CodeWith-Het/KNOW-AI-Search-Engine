import { useDispatch } from 'react-redux';
import { register, login, getUser } from './../service/auth.api.js'
import {setUser,setLoading,setError} from "./../auth.slice.js"

export const useAuth = () => {
    const dispatch = useDispatch()
    
    const registerUser = async ({ username, email, password }) => {
        try {
            dispatch(setLoading(true))

            const response = await register({ username, email, password })
            dispatch(setUser(response.user))
        }
        catch (error) {
            dispatch(setError(error.message))
            throw error
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    const loginUser = async ({ loginId, password }) => {
        try {
            dispatch(setLoading(true))

            const response = await login({ loginId, password })
            dispatch(setUser(response.user))
        }
        catch (error) {
            dispatch(setError(error.message))
            throw error
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    const getUserDetails = async () => {
        try {
            dispatch(setLoading(true))

            const response = await getUser()
            dispatch(setUser(response.user))
        }
        catch (error) {
            dispatch(setError(error.message))
            throw error
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    return {
    registerUser, loginUser, getUserDetails
    }
}