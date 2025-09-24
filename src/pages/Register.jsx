import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export const Register = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const navigate = useNavigate()

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    useEffect(() => {
        const handleNewUser = (newUserData) => {
            console.log('Nowy użytkownik:', newUserData);
        };

        socket.on('update-users', handleNewUser);

        return () => {
            socket.off('update-users', handleNewUser);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!username || !email || !password) {
            alert('Wprowadź email, nazwę użytkownika i hasło!');
            return;
        }

        if (!passwordRegex.test(password)) {
            alert(
                'Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!'
            );
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/register', {
                email,
                username,
                password,
            });

            if (response.data.message) {
                alert(response.data.message);
                socket.emit('new-user', { username, email });
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Wystąpił błąd podczas rejestracji.');
            }
        } finally {
            setLoading(false);
        }
    };

    const goToLogin = () => {
        navigate('/');
    };


    return (
        <div className='grid w-screen h-screen place-content-center'>
            <button className='border-4 mb-4 text-center p-2' onClick={goToLogin}>Logowanie</button>
            <form onSubmit={handleSubmit}>
                <div className="border-4 grid w-72 h-64 p-4">
                    <input
                        type="email"
                        placeholder="E-mail"
                        className="border-2 p-2 text-center"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Nazwa użytkownika"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="border-2 mb-2 p-2 text-center"
                    />
                    <div className="flex flex-col items-center">
                        <div className="relative w-full">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="border-2 w-full p-3 pr-12 text-center"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                {password.length}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={togglePassword}
                            className="border-2 p-1 mt-2"
                        >
                            {showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        </button>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="border-2 p-2"
                    >
                        {loading ? 'Dodawanie...' : 'Zarejestruj'}
                    </button>
                </div>
            </form>
        </div>
    )
}
