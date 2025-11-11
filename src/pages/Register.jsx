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

    const togglePassword = () => setShowPassword(prev => !prev);
    const toggleReaptedPassword = () => setShowReaptedPassword(prev => !prev);

    useEffect(() => {
        const handleNewUser = (newUserData) => {
            console.log('Nowy użytkownik:', newUserData);
        };
        socket.on('update-users', handleNewUser);
        return () => socket.off('update-users', handleNewUser);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !repetedPassword) {
            alert('Wprowadź email, nazwę użytkownika i hasło!');
            return;
        }

        if (!passwordRegex.test(password)) {
            alert('Hasło musi mieć min. 8 znaków, 1 dużą literę, 1 małą literę, 1 cyfrę i 1 znak specjalny!');
            return;
        }

        if (password !== repetedPassword) {
            alert('Hasła nie są identyczne!');
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
            alert(error.response?.data?.message || 'Wystąpił błąd podczas rejestracji.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-gradient-to-t from-sky-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl md:w-[600px] md:h-[500px] lg:w-[800px] lg:h-[500px] xl:w-[900px] xl:h-[500px] 2xl:w-[1100px] 2xl:h-[600px] md:grid md:grid-cols-2 overflow-hidden">

                <div className="flex items-center justify-center">
                    <img src={registerIcon} alt="Register" className="xs:mt-6 xs:mb-6 xs:w-40 md:w-52 lg:w-72 xl:w-80" />
                </div>

                <div className="flex flex-col items-center justify-center px-12">
                    <form onSubmit={handleSubmit} className="w-full">
                        <h1 className="xs:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold mb-6 text-gray-800 text-center">
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

                            <div className="flex items-center justify-center relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Hasło"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-2 rounded-md py-2 px-4 text-center w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    autoComplete="new-password"
                                />
                                <img
                                    src={showPassword ? eye : eyeSlash}
                                    onClick={togglePassword}
                                    className="w-6 absolute right-4 cursor-pointer"
                                    alt="toggle password"
                                />
                            </div>

                            <div className="flex items-center justify-center relative">
                                <input
                                    type={showReaptedPassword ? "text" : "password"}
                                    placeholder="Powtórz hasło"
                                    value={repetedPassword}
                                    onChange={(e) => setReptedPassword(e.target.value)}
                                    className="border-2 rounded-md py-2 px-4 text-center w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    autoComplete="new-password"
                                />
                                <img
                                    src={showReaptedPassword ? eye : eyeSlash}
                                    onClick={toggleReaptedPassword}
                                    className="w-6 absolute right-4 cursor-pointer"
                                    alt="toggle password"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="border-2 rounded-md py-2 px-4 bg-indigo-500 text-white hover:bg-indigo-600 transition"
                            >
                                {loading ? 'Rejestrowanie...' : 'Zarejestruj'}
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-col items-center mt-6 space-y-2 xs:mb-6">
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
            </div>
        </div>
    )
}
