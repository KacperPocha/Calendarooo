import axios from 'axios';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import PopUp from './PopUp';

export const Notes = forwardRef((props, ref) => {
    const [notatki, setNotatki] = useState([]);
    const date = localStorage.getItem("date");
    const [isPopUpOpen, SetIsPopUpOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null)
    const notesOpen = true
    const localDate = new Date()
    const now = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`


    const fetchWorkHours = async () => {
        const userID = localStorage.getItem("userID");
        const date = new Date(localStorage.getItem("date"));
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        try {
            const response = await axios.get(`http://localhost:3000/api/notatki/${userID}/${year}/${month}`);
            setNotatki(response.data);
        } catch (error) {
            console.error("Błąd podczas wczytywania danych");
        }
    };

    const deleteNote = async (date) => {
        const userID = localStorage.getItem("userID");
        try {
            await axios.put(`http://localhost:3000/api/delete-note/${userID}/${date}`);
            await fetchWorkHours();
            if (props.onRefresh) {
                props.onRefresh();
            }

        } catch (error) {
            console.error("Błąd podczas usuwania notatki:", error);
        }
    };


    const handleRefreshAfterUpdate = async () => {
        await fetchWorkHours();
        if (props.onRefresh) {
            props.onRefresh();
        }
    };


    useImperativeHandle(ref, () => ({
        fetchWorkHours: async () => {
            await fetchWorkHours();
        }
    }));


    useEffect(() => {
        fetchWorkHours()
    }, [date]);

    return (
        <div className="ml-4">
            <PopUp
                fetchWorkHours={handleRefreshAfterUpdate}
                isOpen={isPopUpOpen}
                onClose={() => SetIsPopUpOpen(false)}
                selectedDate={selectedDate}
                notesOpen={notesOpen}
            />
            <h1 className="text-xl mt-20 mb-2">Notatki:</h1>
            <div>
                {notatki.length === 0 ? (
                    <p className="text-gray-500 italic mt-4">Brak notatek w tym miesiącu.</p>
                ) : (
                    notatki.map((notatka, index) => (
                        <div key={index} className="flex mb-4 cursor-pointer hover:scale-[1.01]  justify-between">
                            <div className='grid' onClick={() => { SetIsPopUpOpen(true); setSelectedDate(notatka.data); }}>
                                <span className="bg-blue-500 text-white w-max px-2 rounded-xl mb-1">{notatka.data}: </span>
                                <span className="bg-yellow-400 rounded-xl w-max px-2">{notatka.noteTitle}</span>
                            </div>
                            <button className='mr-24' onClick={() => deleteNote(notatka.data)}>❌</button>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
});
