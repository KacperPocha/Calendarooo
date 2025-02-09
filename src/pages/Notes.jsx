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
            const response = await axios.get(`http://localhost:5000/api/notatki/${userID}/${year}/${month}`);
            setNotatki(response.data);
        } catch (error) {
            console.error("Błąd podczas wczytywania danych");
        }
    };

    useImperativeHandle(ref, () => ({
        fetchWorkHours
    }))

    useEffect(() => {
        fetchWorkHours()
    }, [date]);
    console.log(notatki)
    return (
        <div className="ml-4">
            <PopUp
                fetchWorkHours={fetchWorkHours}
                isOpen={isPopUpOpen}
                onClose={() => SetIsPopUpOpen(false)}
                selectedDate={selectedDate}
                notesOpen={notesOpen}
            />
            <h1 className="text-xl mt-20 mb-2">Notatki:</h1>
            <div>
                {notatki.map((notatka, index) => (
                    notatka.data < now ?
                        <div key={index} className="grid mb-4 cursor-pointer hover:scale-[1.01]" onClick={() => { SetIsPopUpOpen(true), setSelectedDate(notatka.data) }}>
                            <span className="bg-gray-500 text-white w-max px-2 rounded-xl mb-1">{notatka.data}: </span>
                            <span className="bg-gray-300 rounded-xl w-max px-2">{notatka.noteTitle}</span>
                        </div>
                        :
                        <div key={index} className="grid mb-4 cursor-pointer hover:scale-[1.01]" onClick={() => { SetIsPopUpOpen(true), setSelectedDate(notatka.data) }}>
                            <span className="bg-blue-500 text-white w-max px-2 rounded-xl mb-1">{notatka.data}: </span>
                            <span className="bg-yellow-400 rounded-xl w-max px-2">{notatka.noteTitle}</span>
                        </div>
                ))}
            </div>
        </div>
    );
});
