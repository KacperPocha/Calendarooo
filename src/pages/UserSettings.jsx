import axios from 'axios';
import React, { useEffect, useState } from 'react'

const UserSettings = ({ isOpen, onClose, userRate }) => {
    const [rate, setRate] = useState(0)
    
    useEffect(() =>{
        setRate(userRate)
    }, [userRate])
    
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const userID = localStorage.getItem("userID");
      
        try {
          const response = await axios.put(
            `http://localhost:3000/api/updaterate/${userID}`,
            { rate: rate }
          );
          console.log(response.data.message);
          onClose();
        } catch (error) {
          console.error("Błąd podczas zapisywania stawki:", error);
        }
      };
      

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-96 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end">
                    <button
                        onClick={() => {
                            onClose();
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
                    >
                        Zamknij
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='grid mt-4'>
                    <div>
                        <label htmlFor="rate" className='mr-2'>Stawka brutto: </label>
                        <input type="number" name="rate" className='border-2 border-black' value={rate} onChange={(e) => setRate(e.target.value)}/>
                    </div>
                    <button className='bg-blue-500 text-white px-4 py-2 rounded w-24 mt-8' type="submit">
                        Zapisz
                    </button>
                </form>
            </div>
        </div>
    );
};


export default UserSettings;