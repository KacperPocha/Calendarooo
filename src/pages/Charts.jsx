import React, { useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export const Charts = () => {
    const { userID } = useOutletContext();
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");
    const [data, setData] = useState([])

const refreshData = async () => {
    const userID = localStorage.getItem("userID");
    try {
        const response = await axios.get(`http://localhost:3000/api/get-user-hours/${userID}`, {
            params: {
                startDate: rangeFrom, 
                endDate: rangeTo     
            }
        });

        setData(response.data);
        
    } catch (err) {
        console.error("Błąd pobierania danych:", err);
    }
}
console.log(data)
    return (
        <div>
            <div className="flex">
                <div className='ml-4'>
                    <label className="block mb-2 text-sm text-slate-600">Zakres od:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                        type="date"
                        value={rangeFrom}
                        onChange={(e) => setRangeFrom(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm text-slate-600">Zakres do:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                        type="date"
                        value={rangeTo}
                        onChange={(e) => setRangeTo(e.target.value)}
                    />
                </div>
                <button onClick={refreshData} className='px-3 py-2 h-max mt-7 ml-4 rounded-md bg-blue-500'>Odśwież</button>
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