import { useEffect } from 'react';
import { useAuth } from './useAuth.js'; // 🎯 Path check kar lena agar useAuth.js kisi aur folder me hai

export const useAuthInit = () => {
    const { getUserDetails } = useAuth();

    useEffect(() => {
        // App load hote hi sabse pehle yeh backend se data laakar Redux me daalega
        getUserDetails();
    }, []); 
};
