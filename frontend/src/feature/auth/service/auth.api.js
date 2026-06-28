import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
    withCredentials: true,
});

export const register = async ({ username, email, password }) => {
    try {
        const response = await api.post("/register", { username, email, password });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Registration Failed", { cause: error });
    }
};

export const login = async ({ loginId, password }) => {
    try {
        const response = await api.post("/login", { loginId, password });
        return response.data.user;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Login Failed", { cause: error });
    }
};

export const getUser = async () => {
    try {
        const response = await api.get("/getuser");
        return response.data.user;
    } catch (error) {
        throw new Error(error.response?.data?.message || "User not retrieved", { cause: error });
    }
};

export const logout = async () => {
    try {
        const response = await api.get("/logout");
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Logout Failed", { cause: error });
    }
};