import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AddUser = () => {
    const [username, setusername] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            const response = await axios.post('http://localhost:5000/add-user', {
                username
            }) 
            if(response)
            console.log(response.data)
            alert("Dane zostały dodane")
            navigate('/')
        } catch(error){
            console.log(error)
        }
    }

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
