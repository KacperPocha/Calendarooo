import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';

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
                alert(error.response.data.message); // pokaże np. "Konto nie jest zweryfikowane przez email!"
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
        <div className='w-screen h-screen'>
            <div className='grid w-screen h-screen place-content-center'>
                <button className='border-4 mb-4 text-center p-2' onClick={register}>Rejestracja</button>
                <div className='border-4 grid w-72 h-56'>
                    <form onSubmit={handleSubmit} >
                        <div className='grid'>
                            <input
                                type="text"
                                className='border-2 m-2 text-center'
                                placeholder='Login'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <input
                                type="password"
                                className='border-2 m-2 text-center'
                                placeholder='Hasło'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="border-2 m-2"
                            >
                                {loading ? 'Logowanie...' : 'Zaloguj'}
                            </button>
                        </div>

                    </form>
                    <button onClick={() => navigate('/forgot-password')}>Zapomniałeś hasło?</button>
                </div>

            </div>

        </div>
    )
}