import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export const CheckUser = () => {
    const [username, setusername] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        socket.on('user-logged-in', (userData) => {
            console.log('Zalogowany użytkownik:', userData);
        });

        return () => {
            socket.off('user-logged-in'); 
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username) {
            alert("Wprowadź nazwę użytkownika!");
            return;
        }
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3000/api/login', { username });
            if (response.data.userID) {
                localStorage.setItem('userID', response.data.userID);
                alert('Logowanie pomyślne!');
                
                socket.emit('user-logged-in', { userID: response.data.userID, username: username });
                
                navigate('/calendar');
            } else {
                alert("Błąd logowania: Brak ID użytkownika");
            }
        } catch (error) {
            console.error(error);
            alert("Błąd logowania. Użytkownik nie istnieje.");
        } finally {
            setLoading(false);
        }
    };
    
      const register = () => {
        navigate('/register')
      }


  return (
    <div className='w-screen h-screen'>
        <button className='border-4 mt-2 ml-2 p-2' onClick={() => navigate('/deleteuser')}>Usuwanie użytkowników</button>
        <div className='grid w-screen h-screen place-content-center'>
            <button className='border-4 mb-4 text-center p-2' onClick={register}>Dodaj użytkownika</button>
            <form onSubmit={handleSubmit} >
                <div className='border-4 grid w-72 h-56'>
                    <input type="text" className='border-2 m-12 text-center' value={username} onChange={(e) => setusername(e.target.value) }/>
                    <button type='submit'>
                        Sprawdź
                    </button>
                </div>

            </form>
        </div>
        
    </div>
  )
}