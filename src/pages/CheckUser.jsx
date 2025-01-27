import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const CheckUser = () => {
    const [username, setusername] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://localhost:5000/login', { username });
            if (response.data.userID) {
                localStorage.setItem('userID', response.data.userID); 
                navigate('/calendar'); 
            } else {
                alert("Błąd logowania: Brak ID");
            }
        } catch (err) {
            console.error(err);
            alert("Użytkownik nie istnieje");
        }
    };
    console.log(localStorage)
    
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