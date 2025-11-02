import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { CalendarComponent } from "./CalendarComponent";
import { SalaryCalc } from "./SalaryCalc";
import Usersettings from "./UserSettings";
import { Notes } from "./Notes";

export const Calendar = () => {
    const { user } = useOutletContext(); 

    const [userId, setUserId] = useState(localStorage.getItem("userID"));
    const [userSetting, setUserSetting] = useState({});
    const [hours, setHours] = useState([]);
    const [isPopUpOpen, setIsPopUpOpen] = useState(false);
    const [daysArrayFromChild, setDaysArrayFromChild] = useState([]);
    const [mode, setMode] = useState("main");
    const [rawData, setRawData] = useState([]);
    const notesRef = useRef();
    const calendarRef = useRef();
    const navigate = useNavigate();

    const date = new Date(localStorage.getItem("date"));
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    useEffect(() => {
        if (userId) {
            refreshUserSettings();
        }
    }, [userId]);

    useEffect(() => {
        if (isPopUpOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isPopUpOpen]);

    useEffect(() => {
        refreshUserSettings();
    }, [month, year]);

    const handleDaysArrayFromChild = (data) => {
        setDaysArrayFromChild(data);
    };
    
    const refreshAllData = async () => {
        await Promise.all([
            notesRef.current?.fetchWorkHours(),
            calendarRef.current?.fetchWorkHours()
        ]);
    };

    const refreshUserSettings = async () => {
        const userID = localStorage.getItem('userID')
        if (!userID) return
        try {
            const res = await axios.get(`http://localhost:3000/api/get-monthly-settings/${userID}/${year}/${month}`)
            setUserSetting(res.data)
        } catch (err) {
            console.error('Błąd przy pobieraniu ustawień miesięcznych:', err)
        }
    };
    
    return (
        <div className="w-full">
            <Usersettings
                mode={mode}
                isOpen={isPopUpOpen}
                onClose={() => setIsPopUpOpen(false)}
                onSettingsSaved={refreshUserSettings}
                date={hours}
            />

            <div className="grid grid-cols-13 w-full">
                <div className="col-start-1 col-end-2 col-span-2">
                    <Notes
                        ref={notesRef} onRefresh={refreshAllData} />
                </div>
                <div className="col-span-8 col-start-2 col-end-12">
                    <CalendarComponent
                        setRawData={setRawData}
                        ref={calendarRef}
                        workHoursInfo={setHours}
                        daysArrayFromChild={handleDaysArrayFromChild}
                        onRefresh={refreshAllData}
                    />
                </div>
                <div className="col-start-12 col-span-2">
                    <SalaryCalc
                        rawData={rawData}
                        mode={mode}
                        setMode={setMode}
                        setIsPopUpOpen={setIsPopUpOpen}
                        workHoursInfo={hours}
                        userSetting={userSetting}
                        daysArray={daysArrayFromChild}
                    />
                </div>
            </div>
        </div>
    );
};