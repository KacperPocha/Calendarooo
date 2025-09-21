import React, { useEffect, useRef, useState } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarComponent } from "./CalendarComponent";
import { SalaryCalc } from "./SalaryCalc";
import UserSettings from "./UserSettings";
import { Notes } from "./Notes";
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export const Calendar = () => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [hours, setHours] = useState([]);
  const [isPopUpOpen, SetIsPopUpOpen] = useState(false);
  const [daysArrayFromChild, setDaysArrayFromChild] = useState([])
  const notesRef = useRef()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    socket.on('update-users', (newUserData) => {
      console.log('Nowy użytkownik:', newUserData);
    });

    return () => {
      socket.off('update-users');
    };
  }, []);

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
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/get-user-info/${userId}`
        );
        if (response.data && response.data) {
          setUser(response.data);
          socket.emit('user-logged-in', { 
            userID: userId, 
            username: response.data.username });
        } else {
          alert("Błąd logowania: Brak ID");
        }
      } catch (err) {
        console.error(err);
        alert("Użytkownik nie istnieje");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      getUser();
    }
  }, [userId]);
  console.log(user)
  return (
    <div className="w-full">
      <UserSettings
        isOpen={isPopUpOpen}
        onClose={() => SetIsPopUpOpen(false)}
        userRate={user?.rate || 0}
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
            Witaj, {user?.username}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-12 w-full">
        <div className=" col-span-3">
          <Notes
            ref={notesRef} />
        </div>
        <div className="col-span-6 col-start-4">
          <CalendarComponent workHoursInfo={getData}
            daysArrayFromChild={handleDaysArrayFromChild}
            onRefreshNotes={() => notesRef.current?.fetchWorkHours()}
          />
        </div>
        <div className="col-span-3">
          <SalaryCalc workHoursInfo={hours}
            userRate={user?.rate || 0}
            daysArray={daysArrayFromChild}
          />
        </div>
      </div>
    </div>
  );
};
