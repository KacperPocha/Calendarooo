import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import resetPasswordIcon from '/images/resetPasswordIcon.webp'
import eye from '/images/eye.svg'
import eyeSlash from '/images/eyeSlash.svg'

export const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [repetedPassword, setReptedPassword] = useState('')
    const [loading, setLoading] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const [showReaptedPassword, setShowReaptedPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !repetedPassword) {
            alert('Wprowadź hasło');
            return;
        }

        if (password !== repetedPassword) {
            alert('Hasła nie są takie same');
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
            const response = await axios.post('http://localhost:3000/api/reset-password', {
                password,
                token,
            });

            if (response.data.message) {
                alert(response.data.message);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Wystąpił błąd podczas resetowania hasła.');
            }
        } finally {
            setLoading(false);
        }
    };

    const togglePassword = () => setShowPassword(prev => !prev);
    const toggleReaptedPassword = () => setShowReaptedPassword(prev => !prev);

    return (
        <div className="w-screen h-screen bg-gradient-to-t from-sky-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[400px] xl:w-[900px] xl:h-[500px] 2xl:w-[1100px] 2xl:h-[600px] md:grid md:grid-cols-2 overflow-hidden">
                <div className="flex items-center justify-center">
                    <img src={resetPasswordIcon} alt="Reset Password" className="xs:mt-6 xs:mb-6 xs:w-40 md:w-52 lg:w-72 xl:w-80" />
                </div>

                <div className="flex flex-col items-center justify-center px-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm">
                        <h1 className="xs:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold mb-6 text-gray-800 text-center">
                            Zresetuj hasło
                        </h1>

                        <div className="grid gap-4">
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
                                className="border-2 rounded-md py-2 px-4 bg-indigo-500 text-white hover:bg-indigo-600 transition xs:mb-6"
                            >
                                {loading ? 'Resetowanie...' : 'Resetuj hasło'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
