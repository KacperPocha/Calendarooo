import axios from "axios";
import React, { useEffect, useState } from "react";

const PopUp = ({ isOpen, onClose, selectedDate, setSelectedDate, fetchWorkHours, notesOpen }) => {
  const [workHoursData, setWorkHoursData] = useState(null);
  const [workHours, setWorkHours] = useState(0);
  const [nadgodziny50, setnadgodziny50] = useState(0);
  const [nadgodziny100, setnadgodziny100] = useState(0);
  const [nieobecnosc, setnieobecnosc] = useState(null);
  const [selectDisabled, setSelectDisabled] = useState(false);
  const [notes, setNotes] = useState(false);
  const [noteTitle, setNoteTitle] = useState(null);
  const [noteDescription, setNoteDescription] = useState(null);

  const date = new Date(selectedDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const data = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


  useEffect(() => {
    const handleRefreshPopup = () => {
        if (selectedDate) {
            fetchWorkHoursData(); 
        }
    };

    window.addEventListener('refreshCalendar', handleRefreshPopup);
    
    return () => {
        window.removeEventListener('refreshCalendar', handleRefreshPopup);
    };
}, [selectedDate]);

  useEffect(() => {
    setNotes(notesOpen);
  }, [notesOpen]);

  useEffect(() => {
    if (selectedDate) {
      fetchWorkHoursData();
    }
  }, [selectedDate]);

  const fetchWorkHoursData = async () => {
    const userID = localStorage.getItem("userID");

    try {
      const response = await axios.get(
        `http://localhost:3000/api/get-popup-data/${userID}/${data}`
      );
      setWorkHoursData(response.data);
      setWorkHours(response.data?.godzinyPrzepracowane || 0);
      setnadgodziny50(response.data?.nadgodziny50 || 0);
      setnadgodziny100(response.data?.nadgodziny100 || 0);
      setnieobecnosc(response.data?.nieobecnosc || null);
      setNoteTitle(response.data?.noteTitle ?? null);
      setNoteDescription(response.data?.noteDescription ?? null);
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
    setNotes(false);
    const parsedWorkHours = Number(workHours);
    if (isNaN(parsedWorkHours)) {
      alert("Proszę wprowadzić prawidłową liczbę godzin");
      return;
    }

    if (
      parsedWorkHours !== workHoursData?.godzinyPrzepracowane ||
      nadgodziny50 !== workHoursData?.nadgodziny50 ||
      nadgodziny100 !== workHoursData?.nadgodziny100 ||
      nieobecnosc !== workHoursData?.nieobecnosc ||
      noteTitle !== workHoursData?.noteTitle ||
      noteDescription !== workHoursData?.noteDescription
    ) {
      const userID = localStorage.getItem("userID");

      try {
        await axios.put(
          `http://localhost:3000/api/update-work-hours/${userID}/${data}`,
          {
            godzinyPrzepracowane: parsedWorkHours,
            nadgodziny50: nadgodziny50,
            nadgodziny100: nadgodziny100,
            nieobecnosc: nieobecnosc,
            noteTitle: noteTitle,
            noteDescription: noteDescription
          }
        );

        setWorkHours(parsedWorkHours);
        setnadgodziny50(nadgodziny50);
        setnadgodziny100(nadgodziny100);
        setnieobecnosc(nieobecnosc);
        setNoteTitle(noteTitle);
        setNoteDescription(noteDescription);
        window.dispatchEvent(new CustomEvent('refreshCalendar'));
        onClose();
        fetchWorkHours();
      } catch (error) {
        console.error("Błąd podczas zapisywania godzin:", error);
      }
    } else {
      console.log("Brak zmian w danych.");
      onClose();
    }
  };

  useEffect(() => {
    if (workHours === 0 && nadgodziny50 === 0 && nadgodziny100 === 0) {
      setSelectDisabled(false);
    } else {
      setnieobecnosc("");
      setSelectDisabled(true);
    }
  }, [workHours, nadgodziny50, nadgodziny100]);

  const handleBlur = (setter, value) => {
    setter(value === "" ? 0 : value);
  };

  if (!isOpen) return null;

  const Close = () => {
    setNotes(false);
    setWorkHoursData(0);
    setWorkHours(0);
    setnadgodziny50(0);
    setnadgodziny100(0);
    setnieobecnosc(null);
    setNoteTitle(null);
    setNoteDescription(null);
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50 overflow-auto"
      onClick={() => { Close(); onClose(); }}
    >
      <div
        className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-xl max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => { Close(); onClose(); }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Zamknij
          </button>
        </div>
        <form onSubmit={handleOnSubmit} className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm text-slate-600">Data:</label>
              <input
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                type="text"
                value={data}
                disabled
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-600">Ilość godzin zwykłych:</label>
              <input
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                type="number"
                value={workHours === null ? 0 : workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                onBlur={(e) => handleBlur(setWorkHours, e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 50%:</label>
              <input
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                type="number"
                value={nadgodziny50}
                onChange={(e) => setnadgodziny50(e.target.value)}
                onBlur={(e) => handleBlur(setnadgodziny50, e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-slate-600">Ilość nadgodzin 100%:</label>
              <input
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                type="number"
                value={nadgodziny100}
                onChange={(e) => setnadgodziny100(e.target.value)}
                onBlur={(e) => handleBlur(setnadgodziny100, e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="block mb-2 text-sm text-slate-600">
                Powód nieobecności/ wcześniejszego wyjścia:
              </label>
              <select
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                value={nieobecnosc}
                onChange={(e) => setnieobecnosc(e.target.value)}
                disabled={selectDisabled}
              >
                <option value="null">-</option>
                <option value="L4">L4</option>
                <option value="Krwiodastwo">Krwiodastwo</option>
                <option value="Siła wyższa">Siła wyższa</option>
                <option value="Urlop">Urlop</option>
              </select>
            </div>
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
            <div className="grid gap-6">
              <div className="w-full">
                <label className="block mb-2 text-sm text-slate-600">Tytuł notatki:</label>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                  type="text"
                  value={noteTitle || ""}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-slate-600">Treść notatki:</label>
                <textarea
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                  value={noteDescription || ""}
                  onChange={(e) => setNoteDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Zapisz
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
        </form>
      </div>
    </div>
  );
};

export default PopUp;
