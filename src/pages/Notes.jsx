import axios from 'axios';
import React, { useEffect, useState } from 'react'

export const Notes = () => {
    const [notatki, setNotatki] = useState([]);
    const date = localStorage.getItem("date");

    const fetchNotes = async () => {
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

    useEffect(() => {
        fetchNotes();
    }, [date]);

    return (
        <div className="ml-4">
            <h1 className="text-xl mt-20 mb-2">Notatki:</h1>
            <NoteInput onNoteAdded={fetchNotes} />
            <div>
                {notatki.map((notatka, index) => (
                    <div key={index} className="grid mb-4">
                        <span className="bg-blue-500 text-white w-max px-2 rounded-xl mb-1">{notatka.data}: </span>
                        <span className="bg-yellow-400 rounded-xl w-max px-2">{notatka.noteTitle}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
