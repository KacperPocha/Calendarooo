import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import io from 'socket.io-client';
import { Nav } from "./Nav";
import Usersettings from "./UserSettings";

const socket = io('http://localhost:3000');

export const Layout = () => {
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [isMainSettingsOpen, setIsMainSettingsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setUserId(localStorage.getItem("userID"));
    }, []);
    
    useEffect(() => {
        socket.on('update-users', (newUserData) => console.log('Nowy użytkownik:', newUserData));
        return () => socket.off('update-users');
    }, []);

    useEffect(() => {
        if (isMainSettingsOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isMainSettingsOpen]);

    useEffect(() => {
        const getUser = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(`http://localhost:3000/api/get-user-info/${userId}`);
                if (response.data) {
                    setUser(response.data);
                    socket.emit('user-logged-in', { userID: userId, username: response.data.username });
                }
            } catch (err) {
                console.error(err);
            }
        };
        getUser();
    }, [userId]);

    return (
        <div className="w-full">
            <div className="flex w-full">
                <Nav
                    setMode={() => {}} 
                    setIsPopUpOpen={setIsMainSettingsOpen}
                    onLogoutClick={() => {
                        navigate("/");
                        localStorage.clear();
                    }}
                    user={user}
                />
                
                <Usersettings
                    mode="main"
                    isOpen={isMainSettingsOpen}
                    onClose={() => setIsMainSettingsOpen(false)}
                    onSettingsSaved={() => console.log("Główne ustawienia zapisane.")}
                />
            </div>

            <Outlet context={{ user }} />
        </div>
    );
};