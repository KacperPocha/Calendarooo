import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';
import registerIcon from '/images/registerIcon.webp'
import eye from '/images/eye.svg'
import eyeSlash from '/images/eyeSlash.svg'


const socket = io('http://localhost:3000');

export const Register = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [repetedPassword, setReptedPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);
    const [showReaptedPassword, setShowReaptedPassword] = useState(false);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const navigate = useNavigate()

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const toggleReaptedPassword = () => {
        setShowReaptedPassword(prev => !prev);
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


        if (!username || !email || !password || !repetedPassword) {
            alert('Wprowadź email, nazwę użytkownika i hasło!');
            return;
        }

        if (!passwordRegex.test(password)) {
            alert(
                'Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!'
            );
            return;
        }

        if(password !== repetedPassword) {
            alert('Hasła nie są identyczne!')
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
        <div className="w-screen h-screen bg-gradient-to-t from-sky-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[500px] grid grid-cols-2 overflow-hidden">

                <div className="flex items-center justify-center">
                    <img src={registerIcon} alt="Register" className="w-60" />
                </div>

                <div className="flex flex-col items-center justify-center px-12">
                    <form onSubmit={handleSubmit} className='w-full max-w-sm'>
                        <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">
                            Zarejestruj się
                        </h1>

                        <div className="grid gap-4">
                            <input
                                type="email"
                                placeholder="E-mail"
                                className="border-2 rounded-md py-2 px-4 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="off"
                            />
                            <input
                                type="text"
                                placeholder="Nazwa użytkownika"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="border-2 rounded-md py-2 px-4 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                autoComplete="off"
                            />
                            <div className='flex items-center'>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-2 rounded-md py-2 px-14 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    autoComplete="new-password"
                                />

                                <span className="text-gray-500 text-sm ml-3">
                                    {password.length}
                                </span>
                                <img
                                    src={showPassword === false ? eyeSlash : eye}
                                    onClick={togglePassword}
                                    className="w-6 ml-4"
                                />


                            </div>

                            <div className='flex items-center'>
                                <input
                                    type={showReaptedPassword ? "text" : "password"}
                                    placeholder="Powtórz hasło"
                                    value={repetedPassword}
                                    onChange={(e) => setReptedPassword(e.target.value)}
                                    className="border-2 rounded-md py-2 px-14 text-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    autoComplete="new-password"
                                />

                                <span className="text-gray-500 text-sm ml-3">
                                    {repetedPassword.length}
                                </span>
                                <img
                                    src={showReaptedPassword === false ? eyeSlash : eye}
                                    onClick={toggleReaptedPassword}
                                    className="w-6 ml-4"
                                />


                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="border-2 rounded-md py-2 px-4 bg-indigo-500 text-white hover:bg-indigo-600 transition"
                            >
                                {loading ? 'Dodawanie...' : 'Zarejestruj'}
                            </button>
                            <div className="flex flex-col items-center space-y-4">
                                <button
                                    className="text-indigo-600 hover:underline"
                                    onClick={() => navigate('/')}
                                >
                                    Logowanie
                                </button>
                                <button
                                    className="text-gray-600 hover:underline"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Zapomniałeś hasła?
                                </button>

                            </div>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    )
}
