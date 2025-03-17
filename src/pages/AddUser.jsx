import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export const AddUser = () => {
    const [username, setusername] = useState("")
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        socket.on('update-users', (newUserData) => {
            console.log('Nowy użytkownik:', newUserData);
        });

        return () => {
            socket.off('update-users');
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
            const response = await axios.post('http://localhost:3000/api/add-user', {
                username
            });
            if (response) {
                console.log(response.data);
                alert("Dane zostały dodane!");

                socket.emit('new-user', response.data);

                navigate('/');
            }
        } catch (error) {
            console.error(error);
            alert("Wystąpił błąd podczas dodawania użytkownika.");
        } finally {
            setLoading(false); 
        }
    };

    const check = () => {
        navigate('/')
      }


  return (
    <div className='grid w-screen h-screen place-content-center'>
            <button className='border-4 mb-4 text-center p-2' onClick={check}>Sprawdź użytkownika</button>
        <form onSubmit={handleSubmit} >
            <div className='border-4 grid w-72 h-56'>
                <input type="text" className='border-2 m-12 text-center' value={username} onChange={(e) => setusername(e.target.value) }/>
                <button type='submit'>
                    Dodaj
                </button>
            </div>

        </form>

    </div>
  )
}
