import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import forgotPasswordIcon from '/images/forgotPasswordIcon.webp'

export const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            alert('Wprowadź email!');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/forgot-password', {
                email,
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

    return (
        <div className="w-screen h-screen bg-gradient-to-t from-sky-500 to-indigo-600 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl md:w-[600px] md:h-[400px] lg:w-[800px] lg:h-[400px] xl:w-[900px] xl:h-[500px] 2xl:w-[1100px] 2xl:h-[600px] md:grid md:grid-cols-2 overflow-hidden">
                <div className="flex items-center justify-center">
                    <img src={forgotPasswordIcon} alt="Login" className="xs:mt-6 xs:mb-6 xs:w-40 md:w-52 lg:w-72 xl:w-80" />
                </div>

                <div className="flex flex-col items-center justify-center px-12">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm">
                        <h1 className="xs:text-2xl md:text-2xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-semibold mb-6 text-gray-800 text-center">
                            Zapomniałem hasła
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="border-2 rounded-md py-2 px-4 bg-indigo-500 text-white hover:bg-indigo-600 transition"
                            >
                                {loading ? 'Resetowanie...' : 'Resetuj hasło'}
                            </button>

                            <div className="flex flex-col items-center mt-6 space-y-2 xs:mb-6">
                                <button
                                    className="text-indigo-600 hover:underline"
                                    onClick={() => navigate('/')}
                                >
                                    Logowanie
                                </button>
                                <button
                                    className="text-gray-600 hover:underline"
                                    onClick={() => navigate('/register')}
                                >
                                    Rejestracja
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
