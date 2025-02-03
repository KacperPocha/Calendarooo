import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarComponent } from "./CalendarComponent";
import { SalaryCalc } from "./SalaryCalc";
import UserSettings from "./userSettings";
import { Notes } from "./Notes";

export const Calendar = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState([]);
  const [hours, setHours] = useState([]);
  const [isPopUpOpen, SetIsPopUpOpen] = useState(false);
  const [daysArrayFromChild, setDaysArrayFromChild] = useState([])


  const navigate = useNavigate();

  const handleDaysArrayFromChild = (data) => {
    setDaysArrayFromChild(data)
  }


  useEffect(() => {
    setUserId(localStorage.getItem("userID"));
  }, []);

  const getData = (workHours) => {
    setHours(workHours);
  };

  useEffect(() => {
    if (isPopUpOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPopUpOpen]);


  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/get-user-info/${userId}`
        );
        if (response.data && response.data.length > 0) {
          setUser(response.data[0]);
        } else {
          alert("Błąd logowania: Brak ID");
        }
      } catch (err) {
        console.error(err);
        alert("Użytkownik nie istnieje");
      }
    };

    if (userId) {
      getUser();
    }
  }, [userId]);



  return (
    <div className="w-full">
      <UserSettings
        isOpen={isPopUpOpen}
        onClose={() => SetIsPopUpOpen(false)}
        userRate={user.rate}
      />
      <div className="row flex justify-end items-center mt-2 ml-2 mb-8">
        <button className="mr-4" onClick={() => SetIsPopUpOpen(true)}>⚙️</button>
        <button
          onClick={() => {
            navigate("/");
            localStorage.clear();
          }}
          className="text-xl"
        >
          🚪
        </button>
        <div>
          <p className="text-md mr-2 ml-4 cursor-default">
            Witaj, {user.username}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 w-full">
        <div className="col-span-3">
          <Notes/>
        </div>
        <div className="col-span-6 col-start-4">
          <CalendarComponent workHoursInfo={getData}
          daysArrayFromChild={handleDaysArrayFromChild} 
          />
        </div>
        <div className="col-span-3">
          <SalaryCalc workHoursInfo={hours}
          userRate={user.rate}
          daysArray={daysArrayFromChild}
          />
        </div>
      </div>
    </div>
  );
};
