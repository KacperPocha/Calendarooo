import axios from "axios";
import React, { useEffect, useState } from "react";

const PopUp = ({ isOpen, onClose, selectedDate, setSelectedDate, fetchWorkHours, notesOpen }) => {
    const [rangeMode, setRangeMode] = useState(false);
    const [fromDate, setFromDate] = useState('');
    const [withoutWeekends, setWithoutWeekends] = useState(false)
    const [toDate, setToDate] = useState("");
    const [workHoursData, setWorkHoursData] = useState(null);
    const [workHours, setWorkHours] = useState(0);
    const [nightHours, setNightHours] = useState(0);
    const [nadgodziny50, setnadgodziny50] = useState(0);
    const [nadgodziny100, setnadgodziny100] = useState(0);
    const [nadgodziny50Nocne, setNadgodziny50Nocne] = useState(0);
    const [nadgodziny100Nocne, setNadgodziny100Nocne] = useState(0);
    const [silaWyzsza, setSilaWyzsza] = useState(0)
    const [nieobecnosc, setnieobecnosc] = useState(null);
    const [selectDisabled, setSelectDisabled] = useState(false);
    const [notes, setNotes] = useState(false);
    const [notesList, setNotesList] = useState([]);
    const [newNote, setNewNote] = useState({ title: "", description: "", time: "" });

    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const data = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


    const formatTime = (hoursDecimal) => {
        if (hoursDecimal === null || hoursDecimal === undefined) return "00:00";
        const hours = Math.floor(hoursDecimal);
        const minutes = Math.round((hoursDecimal - hours) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const parseTime = (timeString) => {
        if (!timeString) return 0;
        const [h, m] = timeString.split(":").map(Number);
        return h + m / 60;
    };


    useEffect(() => {
        setNotes(notesOpen);
    }, [notesOpen]);

    useEffect(() => {
        if (isOpen && selectedDate) {
            fetchWorkHoursData();
            fetchNotes();
        }
    }, [isOpen, selectedDate]);

    const fetchNotes = async () => {
        const userID = localStorage.getItem("userID");
        try {
            const res = await axios.get(`http://localhost:3000/api/notes/${userID}/${data}`);
            setNotesList(res.data);
        } catch (error) {
            console.error("Błąd podczas pobierania notatek:", error);
            setNotesList([]);
        }
    }

    const fetchWorkHoursData = async () => {
        const userID = localStorage.getItem("userID");

        try {
            const response = await axios.get(
                `http://localhost:3000/api/get-popup-data/${userID}/${data}`
            );
            setWorkHoursData(response.data);
            setWorkHours(response.data?.godzinyPrzepracowane || 0);
            setNightHours(response.data?.godzinyNocne || 0);
            setnadgodziny50(response.data?.nadgodziny50 || 0);
            setnadgodziny100(response.data?.nadgodziny100 || 0);
            setNadgodziny50Nocne(response.data?.nadgodziny50Nocne || 0);
            setNadgodziny100Nocne(response.data?.nadgodziny100Nocne || 0)
            setSilaWyzsza(response.data?.silaWyzsza || 0);
            setnieobecnosc(response.data?.nieobecnosc === "null" ? null : response.data?.nieobecnosc || null);
        } catch (error) {
            console.error("Błąd podczas pobierania godzin:", error);
        }
    };

    const changeDate = (dir) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + dir);
        setSelectedDate(newDate.toISOString().split("T")[0]);
    };


    const handleOnSubmit = async (e) => {
        e.preventDefault();
        const parsedWorkHours = Number(workHours);
        if (isNaN(parsedWorkHours)) {
            alert("Proszę wprowadzić prawidłową liczbę godzin");
            return;
        }

        const userID = localStorage.getItem("userID");


        if (rangeMode && fromDate && toDate) {
            if (fromDate > toDate) {
                alert("Data startowa nie może być mniejsza od daty końcowej")
                return;
            }
            if (new Date(toDate) - new Date(fromDate) > 31 * 24 * 60 * 60 * 1000) {
                alert("Zakres nie może przekraczać 31 dni");
                return;
            }

            try {
                const start = new Date(fromDate);
                const end = new Date(toDate);
                const updates = [];

                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dayOfWeek = d.getDay();
                    if (withoutWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
                        continue;
                    }

                    const formattedDate = d.toISOString().split("T")[0];
                    updates.push(
                        axios.put(`http://localhost:3000/api/update-work-hours/${userID}/${formattedDate}`, {
                            godzinyPrzepracowane: parsedWorkHours,
                            godzinyNocne: nightHours,
                            nadgodziny50,
                            nadgodziny100,
                            nadgodziny50Nocne,
                            nadgodziny100Nocne,
                            silaWyzsza,
                            nieobecnosc,
                        })
                    );
                }

                await Promise.all(updates);
                setFromDate("");
                setToDate("");
                setRangeMode(false);
                onClose();

                if (fetchWorkHours) setTimeout(fetchWorkHours, 200);
                return;
            } catch (error) {
                console.error("Błąd podczas zapisywania zakresu:", error);
                alert("Wystąpił błąd podczas zapisywania danych zakresu.");
                return;
            }
        }

        if (
            parsedWorkHours !== workHoursData?.godzinyPrzepracowane ||
            nightHours !== workHoursData?.godzinyNocne ||
            nadgodziny50 !== workHoursData?.nadgodziny50 ||
            nadgodziny100 !== workHoursData?.nadgodziny100 ||
            nadgodziny50Nocne !== workHoursData?.nadgodziny50Nocne ||
            nadgodziny100Nocne !== workHoursData?.nadgodziny100Nocne ||
            silaWyzsza !== workHoursData?.silaWyzsza ||
            nieobecnosc !== workHoursData?.nieobecnosc
        ) {
            try {
                await axios.put(
                    `http://localhost:3000/api/update-work-hours/${userID}/${data}`,
                    {
                        godzinyPrzepracowane: parsedWorkHours,
                        godzinyNocne: nightHours,
                        nadgodziny50: nadgodziny50,
                        nadgodziny100: nadgodziny100,
                        nadgodziny50Nocne: nadgodziny50Nocne,
                        nadgodziny100Nocne: nadgodziny100Nocne,
                        silaWyzsza: silaWyzsza,
                        nieobecnosc: nieobecnosc,
                    }
                );

                setWorkHours(parsedWorkHours);
                setNightHours(nightHours);
                setnadgodziny50(nadgodziny50);
                setnadgodziny100(nadgodziny100);
                setNadgodziny50Nocne(nadgodziny50Nocne);
                setNadgodziny100Nocne(nadgodziny100Nocne);
                setSilaWyzsza(silaWyzsza);
                setnieobecnosc(nieobecnosc);
                setFromDate("");
                setToDate("");
                setRangeMode(false);
                onClose();
                if (fetchWorkHours) {
                    setTimeout(fetchWorkHours, 100);
                }
            } catch (error) {
                console.error("Błąd podczas zapisywania godzin:", error);
            }
        } else {
            console.log("Brak zmian w danych godzinowych.");
            onClose();
        }
    };

    const handleAddNote = async () => {
        if (!newNote.title) {
            alert("Tytuł notatki jest wymagany.");
            return;
        }
        const userID = localStorage.getItem("userID");
        try {
            await axios.post(`http://localhost:3000/api/add-note/${userID}/${data}`, {
                title: newNote.title,
                description: newNote.description,
                time: newNote.time || null,
            });
            setNewNote({ title: "", description: "", time: "" });
            fetchNotes();
            if (fetchWorkHours) fetchWorkHours();
        } catch (error) {
            console.error("Błąd podczas dodawania notatki:", error);
        }
    };

    const handleDeleteNote = async (noteID) => {
        if (window.confirm("Czy na pewno chcesz usunąć tę notatkę?")) {
            try {
                await axios.delete(`http://localhost:3000/api/delete-note/${noteID}`);
                fetchNotes();
                if (fetchWorkHours) fetchWorkHours();
            } catch (error) {
                console.error("Błąd podczas usuwania notatki:", error);
            }
        }
    };


    useEffect(() => {
        if (workHours === 0 && nadgodziny50 === 0 && nadgodziny100 === 0) {
            setSelectDisabled(false);
        } else {
            setSelectDisabled(true);
        }
    }, [workHours, nadgodziny50, nadgodziny100]);


    const handleBlur = (setter, value) => {
        setter(value === "" ? 0 : value);
    };

    const getDayOfWeek = (dateString) => {
        const days = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];
        const date = new Date(dateString);
        return days[date.getDay()];
    };

    const deleteData = async () => {
        const userID = localStorage.getItem("userID");
        Close();
        try {
            await axios.put(`http://localhost:3000/api/delete-workHours/${userID}/${data}`);
            await fetchWorkHours()

        } catch (err) {
            console.error(err)
        }
    }


    if (!isOpen) return null;

    const Close = () => {
        setNotes(false);
        onClose();
    };



    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 overflow-auto"
        >
            <div
                className="flex flex-col bg-white rounded-lg shadow-lg p-4 w-full max-w-xl max-h-[90vh] overflow-auto relative"
                onClick={(e) => e.stopPropagation()}
            >

                <div className="flex justify-between mb-4">
                    <div>
                        <label className=" m,block mb-2 text-sm text-slate-600">Data:</label>
                        <input
                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                            type="text"
                            value={data}
                            disabled
                        />
                    </div>
                    <div className="ml-2">
                        <label className=" m,block mb-2 text-sm text-slate-600">Dzień:</label>
                        <input
                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                            type="text"
                            value={getDayOfWeek(data)}
                            disabled
                        />
                    </div>
                    <div className='flex items-center'>
                        <input id="react-checkbox-list" type="checkbox" value="" className="ml-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                            checked={rangeMode}
                            onChange={(e) => {
                                setRangeMode(e.target.checked);
                            }}
                        />
                        <label htmlFor="rate" className='mr-1 text-sm'>Wprowadzanie danych z zakresu </label>
                    </div>



                    <button
                        onClick={() => { Close(); onClose(); }}
                        className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600"
                    >
                        Zamknij
                    </button>
                </div>


                <form onSubmit={handleOnSubmit} className="grid gap-6">
                    {rangeMode && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block mb-2 text-sm text-slate-600">Zakres od:</label>
                                <input
                                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                    type="date"
                                    min="1980-01-01"
                                    max="2060-12-31"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    onBlur={(e) => handleBlur(setFromDate, e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm text-slate-600">Zakres do:</label>
                                <input
                                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                    type="date"
                                    min={fromDate || "1980-01-01"}
                                    max={
                                        fromDate
                                            ? new Date(new Date(fromDate).setMonth(new Date(fromDate).getMonth() + 1))
                                                .toISOString()
                                                .split("T")[0]
                                            : "2060-12-31"
                                    }
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    onBlur={(e) => handleBlur(setToDate, e.target.value)}
                                    disabled={!fromDate}
                                />
                            </div>
                            <div className='flex items-center'>
                                <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 ml-1 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                                    checked={withoutWeekends}
                                    onChange={(e) => setWithoutWeekends(e.target.checked)}
                                />
                                <label htmlFor="rate">Pomiń weekendy </label>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość godzin zwykłych:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(workHours)}
                                onChange={(e) => setWorkHours(parseTime(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość godzin nocnych:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(nightHours)}
                                onChange={(e) => setNightHours(parseTime(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 50%:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(nadgodziny50)}
                                onChange={(e) => setnadgodziny50(parseTime(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 100%:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(nadgodziny100)}
                                onChange={(e) => setnadgodziny100(parseTime(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 50% nocnych:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(nadgodziny50Nocne)}
                                onChange={(e) => setNadgodziny50Nocne(parseTime(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 100% nocnych:</label>
                            <input
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                type="time"
                                value={formatTime(nadgodziny100Nocne)}
                                onChange={(e) => setNadgodziny100Nocne(parseTime(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block mb-2 text-sm text-slate-600">
                                Powód nieobecności / wcześniejszego wyjścia:
                            </label>

                            <select
                                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                value={nieobecnosc ?? ""}
                                onChange={(e) => setnieobecnosc(e.target.value || null)}
                            >
                                <option value="">-</option>
                                <optgroup label="Urlopy płatne">
                                    <option disabled={selectDisabled} value="UW">Urlop wypoczynkowy (UW)</option>
                                    <option disabled={selectDisabled} value="UZ">Urlop na żądanie (UZ)</option>
                                    <option disabled={selectDisabled} value="UO">Urlop okolicznościowy (UO)</option>
                                    <option disabled={selectDisabled} value="UOP">Urlop opiekuńczy (UOP)</option>
                                </optgroup>
                                <optgroup label="Urlopy bezpłatne">
                                    <option disabled={selectDisabled} value="UB">Urlop bezpłatny (UB)</option>
                                </optgroup>
                                <optgroup label="Urlopy rodzicielskie">
                                    <option disabled={selectDisabled} value="UM">Urlop macierzyński (UM)</option>
                                    <option disabled={selectDisabled} value="UOJ">Urlop ojcowski (UOJ)</option>
                                    _ <option disabled={selectDisabled} value="UR">Urlop rodzicielski (UR)</option>
                                    <option disabled={selectDisabled} value="URD1">Urlop rodzicielski 100% (URD1)</option>
                                    <option disabled={selectDisabled} value="URD2">Urlop rodzicielski 60% (URD2)</option>
                                    <option disabled={selectDisabled} value="URD3">Urlop rodzicielski 80% (URD3)</option>
                                </optgroup>
                                <optgroup label="Zwolnienia lekarskie (L4)">
                                    <option disabled={selectDisabled} value="L4100">L4 100% — np. ciąża, wypadek w pracy</option>
                                    <option disabled={selectDisabled} value="L480">L4 80% — zwykłe chorobowe</option>
                                    <option disabled={selectDisabled} value="L450">L4 50% — przedsiębiorca lub zasiłek specjalny</option>
                                </optgroup>
                                <optgroup label="Inne usprawiedliwione">
                                    <option disabled={selectDisabled} value="KR">Oddanie krwi (KR)</option>
                                    <option value="SW">Siła wyższa (SW)</option>
                                    <option disabled={selectDisabled} value="WU">Wezwanie urzędowe (WU)</option>
                                    <option disabled={selectDisabled} value="SZK">Szkolenie (SZK)</option>
                                    <option disabled={selectDisabled} value="DEL">Delegacja (DEL)</option>
                                    <option disabled={selectDisabled} value="PRZ">Przestój niezawiniony (PRZ)</option>
                                </optgroup>
                                <optgroup label="Nieusprawiedliwione">
                                    <option disabled={selectDisabled} value="NB">Nieusprawiedliwiona nieobecność (NB)</option>
                                </optgroup>
                            </select>
                        </div>


                        {nieobecnosc === "SW" ?
                            <div className="mt-4">
                                <label className="block mb-2 text-sm text-slate-600">Siła wyższa:</label>
                                <input
                                    className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                    type="time"
                                    value={formatTime(silaWyzsza)}
                                    onChange={(e) => setSilaWyzsza(parseTime(e.target.value))}
                                />
                            </div>
                            :
                            null}
                        <div>
                            {notes ? (
                                <span
                                    className="underline text-md cursor-pointer "
                                    onClick={() => setNotes(false)}
                                >
                                    Notatki -
                                </span>
                            ) : (
                                <span
                                    className="underline text-md cursor-pointer"
                                    onClick={() => setNotes(true)}
                                >
                                    Notatki +
                                </span>
                            )}
                        </div>
                    </div>

                    {notes && (
                        <div className="grid gap-6 mt-4 border-t pt-4">
                            <h3 className="text-lg font-semibold text-slate-700">Notatki dla tego dnia:</h3>

                            <div className="max-h-40 overflow-y-auto pr-2 space-y-3">
                                {notesList.length > 0 ? (
                                    notesList.map((note) => (
                                        <div key={note.id} className="p-2 border rounded-md bg-slate-50 relative">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="absolute top-1 right-1 text-red-500 hover:text-red-700 text-lg font-bold"
                                            >
                                                &times;
                                            </button>
                                            <div className="font-bold text-slate-800">
                                                {note.time && <span className="text-blue-600 mr-2">[{note.time}]</span>}
                                                {note.title}
                                            </div>
                                            {note.description && (
                                                <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{note.description}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Brak notatek dla tego dnia.</p>
                                )}
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="text-md font-semibold text-slate-700 mb-2">Dodaj nową notatkę:</h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-2">
                                        <label className="block mb-1 text-xs text-slate-600">Tytuł:</label>
                                        <input
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                            type="text"
                                            value={newNote.title}
                                            maxLength={34}
                                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-xs text-slate-600">Godzina (opcj.):</label>
                                        <input
                                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                            type="time"
                                            value={newNote.time}
                                            onChange={(e) => setNewNote({ ...newNote, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <label className="block mb-1 text-xs text-slate-600">Opis (opcj.):</label>
                                    <textarea
                                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                                        value={newNote.description}
                                        onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddNote}
                                    className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                                >
                                    Dodaj notatkę
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-6"
                    >
                        Zapisz godziny i zamknij
                    </button>



                </form>
                <button
                    onClick={deleteData}
                    className="bg-red-400 text-white py-2 rounded hover:bg-red-500"
                    S       >
                    Wyczyść
                </button>
                <div className="flex justify-center mt-4 space-x-4">
                    <button
                        type="button"
                        className="text-2xl"
                        onClick={() => changeDate(-1)}
                    >
                        🡸
                    </button>
                    <button
                        type="button"
                        className="text-2xl"
                        onClick={() => changeDate(1)}
                    >
                        🡺
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PopUp;