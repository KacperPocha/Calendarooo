import React, { useState } from "react";
import calendaroooIcon from "/images/CalendaroooIcon.png";
import { Dropdown } from 'rsuite';
import Hamburger from 'hamburger-react'

export const Nav = ({ setIsPopUpOpen, onLogoutClick, user, setMode }) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className="relative bg-blue-500 w-screen mb-16">
      <div className="flex items-center justify-center h-16 space-x-6 text-white">
        <div className="absolute lg:hidden left-4 top-2">
          <Hamburger toggled={isOpen} toggle={setOpen} />
        </div>

        <a href="/calendar" className="max-lg:hidden p-3 text-xl">Kalendarz</a>
        <a href="/" className="max-lg:hidden p-3 text-xl">Statystyki</a>
        <div className="relative top-5 bg-white rounded-full p-2 shadow-lg">
          <img
            src={calendaroooIcon}
            alt="Logo"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <a href="/charts" className="max-lg:hidden p-3 text-xl">Wykresy</a>
        <a href="" className="max-lg:hidden p-3 text-xl">Raporty</a>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute top-12 left-0 w-max px-24 bg-blue-500 rounded-b-2xl flex flex-col text-white z-50 shadow-lg">
          <a href="/calendar" className="p-4 border-b-2 border-blue-600 hover:scale-[1.02]">
            Kalendarz
          </a>
          <a href="/" className="p-4 border-b-2 border-blue-600 hover:scale-[1.02]">
            Statystyki
          </a>
          <a href="/charts" className="p-4 border-b-2 border-blue-600 hover:scale-[1.02]">
            Wykresy
          </a>
          <a href="/reports" className="p-4 hover:scale-[1.02]">
            Raporty
          </a>
        </div>
      )}

      <div className="absolute right-12 top-4 flex items-center text-white">


        <Dropdown title={
          <button className="text-gray-900 text-md px-2 font-semibold">
            {user?.username}
          </button>
        }
        >
          <Dropdown.Item onClick={() => {
            setIsPopUpOpen(true);
            setMode("main");
          }}>Ustawienia</Dropdown.Item>
          <Dropdown.Item onClick={onLogoutClick}>Wyloguj się</Dropdown.Item>
        </Dropdown>


      </div>


    </div >
  );
};
