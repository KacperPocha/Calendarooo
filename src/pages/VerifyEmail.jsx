import React from 'react'
import { useNavigate } from 'react-router-dom'

export const VerifyEmail = () => {
  const navigate = useNavigate()
  return (
    <div className="flex w-screen h-screen bg-[#222d69] justify-center items-center font-mono">
      <div className="grid">
        <h1 className="text-3xl text-white font-bold">
          Email został zweryfikowany, przejdź do strony logowania
        </h1>
        <button 
        className="border-4 w-fit px-8 py-2 mt-4 text-xl text-white font-bold justify-self-center hover:bg-white hover:text-black"
        onClick={() => navigate('/')}>
          Logowanie
        </button>
      </div>
    </div>

  )
}
