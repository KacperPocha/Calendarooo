import React, { useEffect, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';

export const Charts = () => {
    const { userID } = useOutletContext();
    const [rangeFrom, setRangeFrom] = useState("");
    const [rangeTo, setRangeTo] = useState("");
    const [data, setData] = useState([]);
    const [rangeData, setRangeData] = useState([]);
    const [salaryHistory, setSalaryHistory] = useState([]);


    const absenceTypes = {

        UW: { name: "Urlop wypoczynkowy", rate: 100 },
        UZ: { name: "Urlop na żądanie", rate: 100 },
        UO: { name: "Urlop okolicznościowy", rate: 100 },
        UOP: { name: "Urlop opiekuńczy", rate: 100 },
        USZ: { name: "Urlop szkoleniowy", rate: 100 },

        UB: { name: "Urlop bezpłatny", rate: 0 },
        UC: { name: "Urlop wychowawczy", rate: 0 },

        UM: { name: "Urlop macierzyński", rate: 100 },
        UOJ: { name: "Urlop ojcowski", rate: 100 },
        UR: { name: "Urlop rodzicielski (60%)", rate: 60 },
        "UR 100%": { name: "Urlop rodzicielski (100%)", rate: 100 },
        "UR 80%": { name: "Urlop rodzicielski (80%)", rate: 80 },
        "UR 60%": { name: "Urlop rodzicielski (zasiłek 60%)", rate: 60 },

        "L4 100%": { name: "Zwolnienie lekarskie (L4 – 100%)", rate: 100 },
        "L4 80%": { name: "Zwolnienie lekarskie (L4 – 80%)", rate: 80 },
        "L4 50%": { name: "Zwolnienie lekarskie (L4 – 50%)", rate: 50 },

        KR: { name: "Oddanie krwi (krwiodawstwo)", rate: 100 },
        SW: { name: "Siła wyższa", rate: 50 },
        WU: { name: "Wezwanie urzędowe", rate: 100 },
        SZK: { name: "Szkolenie", rate: 100 },
        DEL: { name: "Delegacja służbowa", rate: 100 },
        PRZ: { name: "Przestój niezawiniony", rate: 100 },

        NB: { name: "Nieusprawiedliwiona nieobecność", rate: 0 },
    };

    const colors = [
        "#2196F3", "#4CAF50", "#FF9800", "#F44336", "#9C27B0",
        "#00BCD4", "#8BC34A", "#FFC107", "#E91E63", "#795548",
        "#607D8B", "#3F51B5", "#009688", "#CDDC39", "#FF5722"
    ];

    const getColor = (index) => colors[index % colors.length]

    useEffect(() => {
        refreshData();
    }, []);

   useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        const localUserID = localStorage.getItem("userID");
        if (!localUserID) return; 
        try {
            const responseHours = await axios.get(`http://localhost:3000/api/get-user-allhours/${localUserID}`);
            setData(responseHours.data);

            const responseSalary = await axios.get(`http://localhost:3000/api/get-salary-history/${localUserID}`);
            setSalaryHistory(responseSalary.data);

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
        "Godziny": godziny,
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

    const absencesSummary = rangeData.reduce((acc, entry) => {
        if (entry.nieobecnosc) {
            const [year, month, day] = entry.data.split("-");
            const key = `${month}/${year}`;

            if (!acc[key]) acc[key] = {};

            acc[key][entry.nieobecnosc] = (acc[key][entry.nieobecnosc] || 0) + 1;
        }
        return acc;
    }, {});


    const absencesChartData = Object.entries(absencesSummary).map(([miesiac, types]) => ({
        miesiac,
        ...types
    }));

    const absenceTotal = rangeData.reduce((acc, entry) => {
        if (entry.nieobecnosc) {
            acc[entry.nieobecnosc] = (acc[entry.nieobecnosc] || 0) + 1;
        }
        return acc;
    }, {});

    const absencePieData = Object.entries(absenceTotal).filter(([type, count]) => count > 0).map(([typ, count]) => ({
        name: absenceTypes[typ]?.name || typ,
        value: count,
    }));

    const absenceHours = (data) => {
        const summary = {};
        data.forEach(entry => {
            if (entry.nieobecnosc) {
                const code = entry.nieobecnosc
                const absenceInfo = absenceTypes[code]
                if (!absenceInfo) return;
                const hours = entry.godzinyPrzepracowane || 8;
                const rate = absenceInfo.rate;
                const paidHours = (hours * rate) / 100;
                if (!summary[code]) {
                    summary[code] = {
                        name: absenceInfo.name,
                        rate: rate,
                        days: 0,
                        totalHours: 0,
                        paidHours: 0
                    };
                }
                summary[code].days += 1;
                summary[code].totalHours += hours;
                summary[code].paidHours += paidHours;
            }
        });
        const sumOfAbsence = Object.values(summary).reduce((sum, item) => sum + item.paidHours, 0);
        return sumOfAbsence;
    }

    return (
        <div className='text-center'>
            <div className=" h-[400px] mr-4 text-center mb-14 pb-8 pt-2 pr-4 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
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
             <div className=" h-[400px] mr-4 text-center mb-14 pb-8 pt-2 pr-4 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
                <span className='text-2xl font-bold'>Wykres Brutto vs Netto</span>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salaryHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="miesiac" />
                        <YAxis />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="Brutto"
                            stroke="#FF9800"
                            strokeWidth={3}
                        />
                         <Line
                            type="monotone"
                            dataKey="Netto"
                            stroke="#4CAF50"
                            strokeWidth={3}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className='grid'>
                <span className='text-2xl font-bold mb-2'>Dane z zakresu</span>
                <span className='text-xl'>Wprowadź zakres, aby wykresy się wypełniły!</span>
            </div>

            <div className="w-full justify-center flex mb-12 ml-6 mt-4">

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
            {rangeData.length === 0 ? null :
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mr-6 mb-16">
                    <div className="h-[350px] pb-8 pt-2 pr-6 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
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
                                    dataKey="Godziny"
                                    stroke="#2196F3"
                                    strokeWidth={3}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-[350px] pb-8 pt-2 pr-6 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
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
                    <div className="h-[350px] pb-8 pt-2 pr-6 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
                        <span className="text-lg font-semibold block mb-2">
                            Wykres nieobecności
                        </span>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={absencesChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="miesiac" />
                                <YAxis />
                                <Tooltip />
                                {
                                    Object.keys(absenceTypes)
                                        .filter((type) =>
                                            absencesChartData.some((row) => row[type] && row[type] > 0)
                                        )
                                        .map((type, index) => (
                                            <Line
                                                key={type}
                                                type="monotone"
                                                dataKey={type}
                                                stroke={getColor(index)}
                                                strokeWidth={2.5}
                                                dot
                                                name={absenceTypes[type].name}
                                            />
                                        ))
                                }
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="h-[350px] pb-8 pt-2 pr-6 ml-2 bg-white rounded-2xl shadow-[0px_0px_19px_-2px_rgba(0,_0,_0,_0.1)]">
                        <span className="text-lg font-semibold block">
                            Udział typów nieobecności
                        </span>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip />
                                <Pie
                                    data={absencePieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={120}
                                    innerRadius={60}
                                    label
                                >
                                    {absencesChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getColor(index)}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            }
        </div >
    );
};