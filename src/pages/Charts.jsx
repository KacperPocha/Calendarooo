import React, { useEffect, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export const Charts = () => {
    const { userID } = useOutletContext();
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");
    const [data, setData] = useState([])
    const [rangeData, setRangeData] = useState([])

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        const userID = localStorage.getItem("userID");
        try {
            const response = await axios.get(`http://localhost:3000/api/get-user-allhours/${userID}`);
            setData(response.data);

        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        }
    }

    const refreshRangeData = async () => {
        const userID = localStorage.getItem("userID");
        try {
            const response = await axios.get(`http://localhost:3000/api/get-user-hours/${userID}`, {
                params: {
                    startDate: rangeFrom,
                    endDate: rangeTo
                }
            });

            setRangeData(response.data);

        } catch (err) {
            console.error("Błąd pobierania danych:", err);
        }
    }


    const rangeSummary = rangeData.reduce((acc, entry) => {
        const [year, month, day] = entry.data.split("-");
        const key = `${month}/${year}`;

        if (!acc[key]) acc[key] = { godziny: 0 };

        acc[key].godziny +=
            (entry.godzinyPrzepracowane ?? 0) +
            (entry.nadgodziny50 ?? 0) +
            (entry.nadgodziny100 ?? 0) +
            (entry.nadgodziny50Nocne ?? 0) +
            (entry.nadgodziny100Nocne ?? 0) +
            (entry.godzinyNocne ?? 0);

        return acc;
    }, {});

    const chartRangeData = Object.entries(rangeSummary).map(([miesiac, { godziny }]) => ({
        miesiac,
        godziny
    }));

    const summary = data.reduce((acc, entry) => {
        const [year, month, day] = entry.data.split("-");
        const key = `${month}/${year}`;

        if (!acc[key]) acc[key] = { Godziny: 0 };

        acc[key].Godziny +=
            (entry.godzinyPrzepracowane ?? 0) +
            (entry.nadgodziny50 ?? 0) +
            (entry.nadgodziny100 ?? 0) +
            (entry.nadgodziny50Nocne ?? 0) +
            (entry.nadgodziny100Nocne ?? 0) +
            (entry.godzinyNocne ?? 0);

        return acc;
    }, {});

    const chartData = Object.entries(summary).map(([miesiac, { Godziny }]) => ({
        miesiac,
        Godziny
    }));

    const overTimeSummary = rangeData.reduce((acc, entry) => {
        const [year, month, day] = entry.data.split("-");
        const key = `${month}/${year}`;

        if (!acc[key]) acc[key] = { nadgodziny50: 0, nadgodziny100: 0 };

        acc[key].nadgodziny50 +=
            (entry.nadgodziny50 ?? 0) + (entry.nadgodziny50Nocne ?? 0);
        acc[key].nadgodziny100 +=
            (entry.nadgodziny100 ?? 0) + (entry.nadgodziny100Nocne ?? 0);

        return acc;
    }, {});

    const overTimeChartData = Object.entries(overTimeSummary).map(
        ([miesiac, { nadgodziny50, nadgodziny100 }]) => ({
            miesiac,
            "Nadgodziny 50%": nadgodziny50,
            "Nadgodziny 100%": nadgodziny100,
        })
    );

    console.log(chartData)

    return (
        <div className='text-center'>
            <div className=" h-[400px] mr-6 text-center mb-14">
                <span className='text-2xl font-bold'>Wykres przepracowanych godzin dla każdego miesiąca</span>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="miesiac" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="Godziny"
                            stroke="#2196F3"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className='grid'>
                <span className='text-2xl font-bold mb-2'>Dane z zakresu</span>
                <span className='text-xl'>Wprowadź zakres, aby wykresy się wypełniły!</span>
            </div>

            <div className="w-full justify-center flex mb-2 ml-6 mt-4">

                <div className='mr-2'>
                    <label className="block mb-2 text-sm text-slate-600">Zakres od:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-6 py-2"
                        type="date"
                        value={rangeFrom}
                        onChange={(e) => setRangeFrom(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block mb-2 text-sm text-slate-600">Zakres do:</label>
                    <input
                        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-6 py-2"
                        type="date"
                        value={rangeTo}
                        onChange={(e) => setRangeTo(e.target.value)}
                    />
                </div>
                <button onClick={refreshRangeData} className='px-3 py-2 h-max mt-7 ml-4 rounded-md bg-blue-500'>Odśwież</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-6">
                <div className="p-4 h-[350px]">
                    <span className="text-lg font-semibold block mb-2">
                        Wykres przepracowanych godzin
                    </span>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartRangeData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="miesiac" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="godziny"
                                stroke="#2196F3"
                                strokeWidth={3}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="p-4 h-[350px]">
                    <span className="text-lg font-semibold block mb-2">
                        Wykres nadgodzin 50% i 100%
                    </span>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={overTimeChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="miesiac" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="Nadgodziny 50%"
                                stroke="#FF9800"
                                strokeWidth={3}
                                dot
                            />
                            <Line
                                type="monotone"
                                dataKey="Nadgodziny 100%"
                                stroke="#4CAF50"
                                strokeWidth={3}
                                dot
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div >
    );
};