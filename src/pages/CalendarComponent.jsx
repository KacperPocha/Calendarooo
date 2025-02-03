import axios from "axios";
import React, { useEffect, useState } from "react";
import PopUp from "./PopUp";
import { useFetcher } from "react-router-dom";

export const CalendarComponent = ({ workHoursInfo, daysArrayFromChild }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workHours, setWorkHours] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [userID, setUserID] = useState(null);
  const [isPopUpOpen, SetIsPopUpOpen] = useState(false);
  const [holidays, setHolidays] = useState([])
  const [dataDay, setDataDay] = useState([])

  useEffect(() => {
    workHoursInfo(workHours)
  }, [workHours])

  useEffect(() => {
    setUserID();
  }, []);

  useEffect(() => {
    fetchWorkHours();
  }, []);

  useEffect(() => {
    if (isPopUpOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPopUpOpen]);

  const daysOfWeek = [
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
    "Niedziela",
  ];

  useEffect(() => {
    const getHolidays = async () => {
      try {
        const response = await axios.get(
          `https://date.nager.at/api/v3/PublicHolidays/${currentDate.getFullYear()}/pl`
        );
        if (response.data && response.data.length > 0) {
          setHolidays(response.data);
        } else {
          alert("Błąd wczytywania danych");
        }
      } catch (err) {
        console.error(err);
        alert("Złe dane");
      }

    };
    getHolidays()

  }, [currentDate])

  const isHoliday = (day) => {
    const dayKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return holidays.some((holiday) => holiday.date === dayKey);
  };



  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };


  const generateDays = () => {
    const daysInMonth = getDaysInMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const firstDayOfMonth = getFirstDayOfMonth(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    const prevMonthDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1); // Poprzedni miesiąc
    const prevMonthLastDay = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    const daysArray = [];

    // Poprzedni miesiąc
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), prevMonthLastDay - i + 1);
      const dayOfWeek = date.getDay();
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      daysArray.push({
        day: prevMonthLastDay - i + 1,
        isOtherMonth: true,
        isPreviousMonth: true,
        isNextMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: holidays.some((holiday) => holiday.date === dayKey),
        noteTitle: dataDay.find((entry) => entry.data === dayKey)?.noteTitle || null

      });
    }

    // Bieżący miesiąc
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dayOfWeek = date.getDay();
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      daysArray.push({
        day: i,
        isOtherMonth: false,
        isPreviousMonth: false,
        isNextMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        isHoliday: holidays.some((holiday) => holiday.date === dayKey),
        noteTitle: dataDay.find((entry) => entry.data === dayKey)?.noteTitle || null

      });
    }

    // Następny miesiąc
    const remainingDays = 7 - (daysArray.length % 7);
    if (remainingDays !== 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        const dayOfWeek = date.getDay();
        const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

        daysArray.push({
          day: i,
          isOtherMonth: true,
          isPreviousMonth: false,
          isNextMonth: true,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          isHoliday: holidays.some((holiday) => holiday.date === dayKey),
          noteTitle: dataDay.find((entry) => entry.data === dayKey)?.noteTitle || null

        });
      }
    }

    return daysArray;
  };


  useEffect(() => {
    daysArrayFromChild(generateDays());
  }, [currentDate, holidays]);



  const changeMonth = (direction) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    );
    setCurrentDate(newDate);
  };

  const fetchWorkHours = async () => {
    const userID = localStorage.getItem("userID");
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/get-calendar-data/${userID}/${year}/${month}`
      );
      const workHoursData = response.data;
      const formattedData = workHoursData.reduce((acc, entry) => {
        acc[entry.data] = entry.godzinyPrzepracowane + entry.nadgodziny50 + entry.nadgodziny100;
        return acc;
      }, {});
      setDataDay(workHoursData)
      setWorkHours(formattedData);
    } catch (error) {
      console.error("Błąd podczas pobierania godzin:", error);
    }
  };

  useEffect(() => {
    localStorage.setItem("date", currentDate)
    fetchWorkHours();
  }, [currentDate]);

  const handleDayClick = (dayObj) => {
    if (!dayObj.isOtherMonth) {
      const dayKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;
      setSelectedDate(dayKey);
      SetIsPopUpOpen(true);
    }
  };




  return (
    <div className="p-4  mx-auto">
      <PopUp
        isOpen={isPopUpOpen}
        onClose={() => SetIsPopUpOpen(false)}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        fetchWorkHours={fetchWorkHours}
      />
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Poprzedni
        </button>
        <h2 className="text-xl font-bold cursor-default">
          {currentDate.toLocaleString("default", { month: "long" })}{" "}
          {currentDate.getFullYear()}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Następny
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="">
              {day}
            </div>
          ))}
        </div>

        {/* Dni w kalendarzu */}
        <div className="grid grid-cols-7 gap-2">
          {generateDays().map((dayObj, index) => {
            const dayKey = `${currentDate.getFullYear()}-${String(
              currentDate.getMonth() + 1
            ).padStart(2, "0")}-${String(dayObj.day).padStart(2, "0")}`;

            return (
              <div
                key={index}
                onClick={() => { { dayObj.isNextMonth ? changeMonth(1) : handleDayClick(dayObj) }; { dayObj.isPreviousMonth ? changeMonth(-1) : handleDayClick(dayObj) } }}
                className={`relative h-28 flex flex-col border rounded shadow cursor-pointer hover:scale-105 ${dayObj.isOtherMonth
                  ? "bg-gray-300"
                  : "bg-gray-100 hover:bg-blue-100"
                  } ${isHoliday(dayObj.day) && !dayObj.isOtherMonth ? "bg-red-200" : ""}`}
              >
                {/* Umieszczenie liczby dnia w prawym górnym rogu */}
                <span className="absolute top-1 right-2 text-lg font-bold">
                  {dayObj.day}
                </span>
                {isHoliday(dayObj.day) && !dayObj.isOtherMonth && (
                  <span className="absolute bottom-1 left-2 text-xs text-red-600">
                    {holidays.find(holiday => holiday.date === dayKey).localName}
                  </span>
                )}

                {/* Wyświetlenie godzin */}
                {!dayObj.isOtherMonth && (
                  <div className="flex items-center justify-center h-full cursor-pointer mb-4">
                    <span className="text-2xl font-medium">
                      {workHours[dayKey] ? `${workHours[dayKey]}h` : ""}
                    </span>
                  </div>
                )}
                {dayObj.noteTitle &&
                  <div className="absolute top-16 bg-yellow-300 rounded rounded-2xl pl-2 pr-2 ml-1 max-w-28 text-sm truncate">
                    <span>{dayObj.noteTitle}</span>
                  </div>
                }

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
