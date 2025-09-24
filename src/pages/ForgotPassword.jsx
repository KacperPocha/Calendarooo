import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
        <div className='grid w-screen h-screen place-content-center'>
            <form onSubmit={handleSubmit}>
                <div className="border-4 grid w-72 h-64 p-4">
                    <div className='grid'>
                        <input
                            type="email"
                            placeholder="E-mail"
                            className="border-2 p-2 text-center"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

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
