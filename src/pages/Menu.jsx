import React, { useState } from "react";
import calendaroooIcon from "/images/CalendaroooIcon.png";
import settings from "/images/settings.webp";

export const Menu = ({ setIsPopUpOpen, onLogoutClick, user, setMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative bg-blue-500 w-screen mb-16">
      <div className="flex items-center justify-center h-16 space-x-6 text-white">
        <a href="/calendar" className="p-3 text-xl">Kalendarz</a>
        <a href="/" className="p-3 text-xl">Statystyki</a>
        <div className="relative top-5 bg-white rounded-full p-2 shadow-lg">
          <img
            src={calendaroooIcon}
            alt="Logo"
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        <a href="/charts" className="p-3 text-xl">Wykresy</a>
        <a href="" className="p-3 text-xl">Raporty</a>
      </div>

      {/* Panel standardowy powyżej 1024px */}
      <div className="max-lg:hidden lg:absolute right-6 top-4 flex items-center text-white">
        <button
          className="mr-4 text-xl"
          onClick={() => {
            setIsPopUpOpen(true);
            setMode("main");
          }}
        >
          <img src={settings} alt="" className="w-6 fill-white" />
        </button>
        <button
          className="text-md rounded-xl border-2 py-1 px-2 hover:bg-gray-300"
          onClick={onLogoutClick}
        >
          Wyloguj
        </button>
        <p className="text-md cursor-default ml-4">{user?.username}</p>
      </div>

      {/* Hamburger dla ekranów <1024px */}
      <div className="lg:hidden absolute right-6 top-4">
        <button
          className="flex flex-col justify-between w-6 h-6 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Prosty hamburger */}
          <span className="block h-0.5 w-6 bg-white rounded"></span>
          <span className="block h-0.5 w-6 bg-white rounded"></span>
          <span className="block h-0.5 w-6 bg-white rounded"></span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-12 flex flex-col items-center bg-blue-500 p-4 rounded shadow-lg space-y-2 text-right">
            <button
              className="text-xl"
              onClick={() => {
                setIsPopUpOpen(true);
                setMode("main");
              }}
            >
              <img src={settings} alt="" className="w-6 fill-white" />
            </button>
            <button
              className="text-md text-white rounded-xl border-2 py-1 px-2 hover:bg-gray-300"
              onClick={onLogoutClick}
            >
              Wyloguj
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
