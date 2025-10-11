import React, { useEffect, useRef, useState } from "react";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CalendarComponent } from "./CalendarComponent";
import { SalaryCalc } from "./SalaryCalc";
import Usersettings from "./UserSettings";
import { Notes } from "./Notes";
import io from 'socket.io-client';
import { Menu } from "./Menu";

const socket = io('http://localhost:3000');

export const Calendar = () => {
  const [userId, setUserId] = useState(null);
  const [userSetting, setUserSetting] = useState({})
  const [user, setUser] = useState(null);
  const [hours, setHours] = useState([]);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [daysArrayFromChild, setDaysArrayFromChild] = useState([])
  const notesRef = useRef();
  const calendarRef = useRef();
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
  const refreshAllData = async () => {
  await Promise.all([
    notesRef.current?.fetchWorkHours(),
    calendarRef.current?.fetchWorkHours()
  ]);
};
  useEffect(() => {
    setUserId(localStorage.getItem("userID"));
  }, []);


  useEffect(() => {
    if(userId){
      refreshUserSettings()
    }
  }, [userId])

  useEffect(() => {
    if (isPopUpOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPopUpOpen]);

  const refreshUserSettings = async () => {
  const userID = localStorage.getItem("userID");
  if (!userID) return;
  try {
    const response = await axios.get(`http://localhost:3000/api/get-settings/${userID}`);
    setUserSetting(prev => ({
      ...prev,
      settings: response.data  
    }));
  } catch (error) {
    console.error("Błąd przy pobieraniu ustawień:", error);
  }
};



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
            username: response.data.username
          });
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


  return (
    <div className="w-full">
      <div className="flex w-full">
        <Menu
          onSettingsClick={() => setIsPopUpOpen(true)}
          onLogoutClick={() => {
            navigate("/");
            localStorage.clear();
          }}
          user={user}
        />

        <Usersettings
          isOpen={isPopUpOpen}
          onClose={() => setIsPopUpOpen(false)}
          onSettingsSaved={refreshUserSettings}
          date={hours}
        />

      </div>
      <div className="grid grid-cols-13 w-full">
        <div className="col-start-1 col-end-2 col-span-2">
          <Notes
            ref={notesRef} onRefresh={refreshAllData} />
        </div>
        <div className="col-span-8 col-start-2 col-end-12">
          <CalendarComponent
            ref={calendarRef}
            workHoursInfo={setHours}
            daysArrayFromChild={handleDaysArrayFromChild}
            onRefresh={refreshAllData}
          />
        </div>
        <div className="col-start-12 col-span-2">
          <SalaryCalc workHoursInfo={hours}
            userSetting={userSetting}
            daysArray={daysArrayFromChild}
          />
        </div>
      </div>
    </div>
  );
};
