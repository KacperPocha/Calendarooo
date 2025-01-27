import axios from "axios";
import React, { useEffect, useState } from "react";

const PopUp = ({ isOpen, onClose, selectedDate, setSelectedDate, fetchWorkHours }) => {
  const [workHoursData, setWorkHoursData] = useState(null);
  const [workHours, setWorkHours] = useState(0);
  const [nadgodziny50, setnadgodziny50] = useState(0);
  const [nadgodziny100, setnadgodziny100] = useState(0);
  const [nieobecnosc, setnieobecnosc] = useState(null);
  const [selectDisabled, setSelectDisabled] = useState(false)


  const date = new Date(selectedDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const data = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;



  
  

  const fetchWorkHoursData = async () => {
    const userID = localStorage.getItem("userID");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/get-popup-data/${userID}/${data}`
      );

      setWorkHoursData(response.data);
      setWorkHours(response.data?.godzinyPrzepracowane || 0);
      setnadgodziny50(response.data?.nadgodziny50 || 0);
      setnadgodziny100(response.data?.nadgodziny100 || 0);
      setnieobecnosc(response.data?.nieobecnosc || null);
    } catch (error) {
      console.error("Błąd podczas pobierania godzin:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchWorkHoursData();
    }
  }, [selectedDate]);

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

    // Jeśli jakakolwiek z wartości godzin została zmieniona, wysyłamy zapytanie
    if (
      parsedWorkHours !== workHoursData?.godzinyPrzepracowane ||
      nadgodziny50 !== workHoursData?.nadgodziny50 ||
      nadgodziny100 !== workHoursData?.nadgodziny100 ||
      nieobecnosc !== workHoursData?.nieobecnosc
    ) {
      const userID = localStorage.getItem("userID");

      try {
        const response = await axios.put(
          `http://localhost:5000/api/update-work-hours/${userID}/${data}`,
          {
            godzinyPrzepracowane: parsedWorkHours,
            nadgodziny50: nadgodziny50,
            nadgodziny100: nadgodziny100,
            nieobecnosc: nieobecnosc,
          }
        );
        console.log("Odpowiedź z backendu:", response.data);
        setWorkHours(parsedWorkHours);
        setnadgodziny50(nadgodziny50);
        setnadgodziny100(nadgodziny100);
        setnieobecnosc(nieobecnosc);
        onClose();
        fetchWorkHours(); // Ponowne pobranie danych
      } catch (error) {
        console.error("Błąd podczas zapisywania godzin:", error);
      }
    } else {
      console.log("Brak zmian w danych.");
      onClose(); // Zamknij popup jeśli nie ma zmian
    }
  };

  useEffect(() => {
    if (workHours === 0 && nadgodziny50 === 0 && nadgodziny100 === 0) {
      setSelectDisabled(false);  
    } else {
      setnieobecnosc("")
      setSelectDisabled(true); 
    }
  }, [workHours, nadgodziny50, nadgodziny100]);

  const handleBlur = (setter, value) => {
    setter(value === "" ? 0 : value)
  }
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-max relative"
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
        <form onSubmit={handleOnSubmit} className="grid ">
          <div className="grid grid-flow-col grid-rows-3">
            <div className="flex mt-4">
              <div className="w-full max-w-sm min-w-[200px] mr-6">
                <label className="block mb-2 text-sm text-slate-600">
                  Data:
                </label>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Type here..."
                  type="text"
                  value={data}
                  disabled
                />
              </div>
              <div className="w-full max-w-sm min-w-[200px]">
                <label className="block mb-2 text-sm text-slate-600">
                  Ilość godzin zwykłych:
                </label>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Type here..."
                  type="number"
                  value={workHours === null ? 0 : workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  onBlur={(e) => handleBlur(setWorkHours, e.target.value)}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-full max-w-sm min-w-[200px] mr-6">
                <label className="block mb-2 text-sm text-slate-600">
                  Ilość nadgodzin 50%:
                </label>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Type here..."
                  type="number"
                  value={nadgodziny50}
                  onChange={(e) => setnadgodziny50(e.target.value)}
                  onBlur={(e) => handleBlur(setnadgodziny50, e.target.value)}
                />
              </div>
              <div className="w-full max-w-sm min-w-[200px]">
                <label className="block mb-2 text-sm text-slate-600">
                  Ilość nadgodzin 100%:
                </label>
                <input
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                  placeholder="Type here..."
                  type="number"
                  value={nadgodziny100}
                  onChange={(e) => setnadgodziny100(e.target.value)}
                  onBlur={(e) => handleBlur(setnadgodziny100, e.target.value)}
                />
              </div>
            </div>
            <div className="flex mt-4">
              <div className="w-max max-w-sm min-w-[200px]">
                <label className="block mb-2 text-sm text-slate-600">
                  Powód nieobecności/ wcześniejszego wyjścia:
                </label>
                <select
                  className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
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
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white ml-1 mr-1 py-1 mt-4 rounded hover:bg-blue-600"
          >
            Zapisz
          </button>
          <div className="flex justify-center mt-3">
            <button type="button" className="text-2xl mr-4" onClick={() => changeDate(-1)}>🡸</button>
            <button type="button" className="text-2xl ml-4" onClick={() => changeDate(1)}>🡺</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PopUp;
