import React, { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'; 
import { Menu } from './Menu';
import UserSettings from './UserSettings';

export const Charts = ({ user, setIsPopUpOpen, onLogoutClick, setMode }) => {
    const [rangeFrom, setRangeFrom] = useState("")
    const [rangeTo, setRangeTo] = useState("")



    return (
        <div>
            <div className="flex w-full">
                {/* Przekaż otrzymane propsy DO komponentu Menu */}
                <Menu
                    user={user}
                    setIsPopUpOpen={setIsPopUpOpen}
                    onLogoutClick={onLogoutClick}
                    setMode={setMode}
                />
            </div>
            <div className="flex">
                <div>
                    <label className="block mb-2 text-sm text-slate-600">Zakres od:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                        type="date"

                    />
                </div>

                <div>
                    <label className="block mb-2 text-sm text-slate-600">Zakres do:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                        type="date"

                    />
                </div>
                <button>Odśwież</button>
            </div>
            <LineChart width={600} height={300} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="Użytkownicy"
                    stroke="#2196F3"
                    strokeWidth={3}
                />
            </LineChart>
        </div>

    );
};