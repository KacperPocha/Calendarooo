import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';

export const ResetPassword = () => {
    const [password, setPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [loading, setLoading] = useState('')
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!password || !repeatPassword) {
            alert('Wprowadź hasło');
            return;
        }

        if (password !== repeatPassword) {
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

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };


    return (
        <div className='grid w-screen h-screen place-content-center'>
            <form onSubmit={handleSubmit}>
                <div className="border-4 grid w-72 h-64 p-4">
                    <div className='grid'>
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


                        </div>
                        <div className="flex flex-col items-center">
                            <div className="relative w-full">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Hasło"
                                    value={repeatPassword}
                                    onChange={(e) => setRepeatPassword(e.target.value)}
                                    className="border-2 w-full p-3 pr-12 text-center"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                    {repeatPassword.length}
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
                            {loading ? 'Resetowanie...' : 'Resetuj hasło'}
                        </button>
                    </div>

                </div>
            </form>
        </div>
    )
}

