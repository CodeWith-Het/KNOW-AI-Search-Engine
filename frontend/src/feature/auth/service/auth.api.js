import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api/auth",
    withCredentials:true
})

export const register =async ({username,email,password}) => {
    try {
        const response = await api.post("/login"{ username, email, password })
        return response.data
    }
    catch (error) {
        return err.response?.data?.message || "Registration Failed"
    }
}

export const login = async ({ loginId, password })=>{
    try {
        const response = await api.post("/login", { loginId, password })
        return response.data
    }
    catch (error) {
        return error.response?.data?.message || "Login Failed"
    }
}

export const getUser = async () => {
    try {
        const response = await api.get("/getuser")
    }
    catch (error) {
        return error.response?.data?.message || "User not get"
    }
}