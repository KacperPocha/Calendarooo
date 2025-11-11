import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';
import loginIcon from '/images/loginIcon.webp'

const socket = io('http://localhost:3000');

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleUserLoggedIn = (userData) => {
            console.log('Zalogowany użytkownik:', userData);
        };

        socket.on('user-logged-in', handleUserLoggedIn);

        return () => {
            socket.off('user-logged-in', handleUserLoggedIn);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            alert('Wprowadź nazwę użytkownika i hasło!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                username,
                password,
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userID', response.data.userID);
                localStorage.setItem('username', response.data.username);

                alert('Logowanie pomyślne!');

                socket.emit('user-logged-in', {
                    userID: response.data.userID,
                    username: response.data.username,
                });

                navigate('/calendar');
            } else {
                alert('Błąd logowania: brak tokena!');
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Błąd logowania. Sprawdź login i hasło.');
            }
        } finally {
            setLoading(false);
        }
    };

    const register = () => {
        navigate('/register')
    }



    return (
        <div className="w-screen h-screen bg-gradient-to-t from-sky-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[400px] xl:w-[900px] xl:h-[500px] 2xl:w-[1100px] 2xl:h-[600px] md:grid md:grid-cols-2 overflow-hidden">

                <div className="flex items-center justify-center">
                    <img src={loginIcon} alt="Login" className="xs:mt-6 xs:mb-6 xs:w-40 md:w-52 lg:w-72 xl:w-80" />
                </div>

                <div className="flex flex-col items-center justify-center px-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm">
                        <h1 className="xs:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold mb-6 text-gray-800 text-center">
                            Zaloguj się
                        </h1>

                        <div className="grid gap-4">
                            <input
                                type="text"
                                className="border-2 rounded-md py-2 px-4 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Login"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                className="border-2 rounded-md py-2 px-4 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                placeholder="Hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="border-2 rounded-md py-2 px-4 bg-indigo-500 text-white hover:bg-indigo-600 transition"
                            >
                                {loading ? 'Logowanie...' : 'Zaloguj'}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-col items-center mt-6 space-y-2 xs:mb-6">
                        <button
                            className="text-indigo-600 hover:underline"
                            onClick={register}
                        >
                            Rejestracja
                        </button>
                        <button
                            className="text-gray-600 hover:underline"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Zapomniałeś hasła?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}