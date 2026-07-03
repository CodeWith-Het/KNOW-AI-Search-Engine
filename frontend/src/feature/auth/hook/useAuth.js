import { useDispatch } from 'react-redux';
import { register, login, getUser, logout, resendVerificationEmail as resendVerificationEmailApi } from './../service/auth.api.js';
import { setUser, setLoading, setError } from './../auth.slice.js';

export const useAuth = () => {
    const dispatch = useDispatch();

    const registerUser = async ({ username, email, password }) => {
        try {
            dispatch(setLoading(true));

            const response = await register({ username, email, password });
            return response;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const loginUser = async ({ loginId, password }) => {
        try {
            dispatch(setLoading(true));

            const user = await login({ loginId, password });
            dispatch(setUser(user));
            return user;
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getUserDetails = async () => {
        try {
            dispatch(setLoading(true));

            const user = await getUser();
            dispatch(setUser(user));
            return user;
        } catch (error) {
            dispatch(setError(error.message));
            dispatch(setUser(null));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const logoutUser = async () => {
        try {
            dispatch(setLoading(true));
            await logout();
            dispatch(setUser(null));
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const resendVerificationEmail = async (email) => {
        try {
            dispatch(setLoading(true));
            return await resendVerificationEmailApi(email);
        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        registerUser,
        loginUser,
        getUserDetails,
        logoutUser,
        resendVerificationEmail,
    };
};