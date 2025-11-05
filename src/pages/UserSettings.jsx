import axios from 'axios';
import React, { useEffect, useState } from 'react'


const UserSettings = ({ isOpen, onClose, userRate, onSettingsSaved, mode }) => {
    const [typeOfJobTime, setTypeOfJobTime] = useState(null)
    const [rateType, setRateType] = useState(null)
    const [taxReliefType, setTaxReliefType] = useState("brak")
    const [vacationDays, setVacationDays] = useState(0)
    const [rate, setRate] = useState(0)
    const [nightAddon, setNightAddon] = useState(0)
    const [checkedNightAddon, setCheckedNightAddon] = useState(false)
    const [PPK, setPPK] = useState(0)
    const [checkedPPK, setCheckedPPK] = useState(false)
    const [tradeUnions, setTradeUnions] = useState(0)
    const [checkedTradeUnions, setCheckedTradeUnions] = useState(false)
    const [otherAddons, setOtherAddons] = useState(0)
    const [constAddons, setConstAddons] = useState(0)
    const date = new Date(localStorage.getItem("date"));
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const userID = localStorage.getItem("userID");


    useEffect(() => {
        setRate(userRate)
    }, [userRate])


    const handleSubmit = async (e) => {
        e.preventDefault()

        if (
            !typeOfJobTime ||
            !rateType ||
            !taxReliefType ||
            vacationDays <= 0 ||
            rate <= 0 ||
            constAddons < 0 ||
            (checkedNightAddon && (nightAddon <= 0 || nightAddon > 100)) ||
            (checkedPPK && (PPK <= 0 || PPK > 100)) ||
            (checkedTradeUnions && (tradeUnions <= 0 || tradeUnions > 100)) ||
            (mode === "monthly" && otherAddons < 0)
        ) {
            alert("Wypełnij wszystkie dane poprawnie");
            return;
        }

        const payload = {
            typeOfJobTime,
            rateType,
            taxReliefType,
            PPK,
            tradeUnions,
            vacationDays,
            rate,
            nightAddon,
            otherAddons,
            constAddons,
        };

        const endpoint =
            mode === "monthly"
                ? `http://localhost:3000/api/update-monthly-settings/${userID}/${year}/${month}`
                : `http://localhost:3000/api/update-settings/${userID}`;

        try {
            const response = await axios.put(endpoint, payload);
            console.log(response.data.message);
            if (onSettingsSaved) onSettingsSaved();
            onClose();
        } catch (error) {
            console.error("Błąd podczas zapisywania ustawień:", error);
        }

    };

    useEffect(() => {
        if (!isOpen || !userID) return;

        const endpoint =
            mode === "monthly"
                ? `http://localhost:3000/api/get-monthly-settings/${userID}/${year}/${month}`
                : `http://localhost:3000/api/get-settings/${userID}`;

        axios
            .get(endpoint)
            .then((res) => {
                const s = res.data;
                setTypeOfJobTime(s.typeOfJobTime);
                setRateType(s.rateType);
                setTaxReliefType(s.taxReliefType);
                setVacationDays(s.vacationDays);
                setPPK(s.PPK);
                setTradeUnions(s.tradeUnions);
                setRate(s.rate);
                setNightAddon(s.nightAddon);
                setOtherAddons(s.otherAddons)
                setConstAddons(s.constAddons);
                
                
            })
            .catch((err) => console.log("Błąd przy ładowaniu ustawień:", err));
    }, [isOpen, mode, userID, year, month]);




    if (!isOpen) return null;



    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="flex flex-col bg-white rounded-lg shadow-lg p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">


                    {mode === "main" ?
                        <span className='text-xl font-medium'>Ustawienia ogólne</span>
                        :
                        <span className='text-xl font-medium'>Ustawienia dla {month}/{year}</span>
                    }

                    <button
                        onClick={() => {
                            onClose();
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
                    >
                        Zamknij
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='grid mt-4'>
                    <div className='mb-4'>
                        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div className="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/1"}
                                        onChange={() => setTypeOfJobTime("1/1")}
                                    />
                                    <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Pełny etat</label>
                                </div>
                            </li>
                            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div className="flex items-center ps-3">
                                    <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/2"}
                                        onChange={() => setTypeOfJobTime("1/2")}
                                    />
                                    <label htmlFor="react-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">1/2 etatu</label>
                                </div>
                            </li>
                            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div className="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/4"}
                                        onChange={() => setTypeOfJobTime("1/4")}
                                    />
                                    <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">1/4 etatu</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className='mb-4'>
                        <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div className="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={rateType === "month"}
                                        onChange={() => setRateType("month")}
                                    />
                                    <label htmlFor="vue-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Stawka miesięczna</label>
                                </div>
                            </li>
                            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div className="flex items-center ps-3">
                                    <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={rateType === "hour"}
                                        onChange={() => setRateType("hour")}
                                    />
                                    <label htmlFor="react-checkbox-list" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Stawka godzinowa</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className='mb-4 flex justify-between items-center'>
                        <label for="small" class="mb-2 dark:text-white">Ulgi podatkowe:</label>
                        <select id="small" class="p-2 px-6 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            onChange={(e) => setTaxReliefType(e.target.value)}
                            value={taxReliefType}
                        >
                            <option value="brak">Brak</option>
                            <option value="mlody">Poniżej 26 r.ż.</option>
                            <option value="emeryt">Emeryt</option>
                            <option value="powrot">Powrót z zagranicy</option>
                            <option value="rodzina4plus">Rodzina 4+</option>
                        </select>


                    </div>
                    <div className='mb-4 flex justify-between'>
                        <label htmlFor="rate" className='mr-2'>Wymiar urlopu: </label>
                        <input type="number" name="rate" min="0" max="365" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={vacationDays} onChange={(e) => setVacationDays(Number(e.target.value))} />
                    </div>
                    {rateType === "month" ?
                        <div className='mb-4 flex justify-between'>
                            <label htmlFor="rate" className='mr-2'>Stawka brutto [mieś.]: </label>
                            <input type="number" name="rate" min="0" max="9999999" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                        </div>
                        :
                        <div className='mb-4 flex justify-between'>
                            <label htmlFor="rate" className='mr-2'>Stawka brutto [/h]: </label>
                            <input type="number" name="rate" min="0" max="9999999" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                        </div>
                    }
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center'>
                            <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                                checked={checkedNightAddon}
                                onChange={(e) => {
                                    setCheckedNightAddon(e.target.checked);
                                    if (e.target.checked) setNightAddon(0);
                                }}
                            />
                            <label htmlFor="rate" className='mr-2'>Dodatek Nocny [%]: </label>
                        </div>

                        <input type="number" name="rate" min="0" max="100" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={nightAddon} onChange={(e) => setNightAddon(Number(e.target.value))} disabled={!checkedNightAddon} />
                    </div>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center'>
                            <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                                checked={checkedPPK}
                                onChange={(e) => {
                                    if (!e.target.checked) setPPK(0);
                                    setCheckedPPK(e.target.checked);
                                    
                                }}
                            />
                            <label htmlFor="rate" className='mr-2'>Składka PPK [%]: </label>
                        </div>

                        <input type="number" name="rate" min="0" max="100" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={PPK} onChange={(e) => setPPK(Number(e.target.value))} disabled={!checkedPPK} />
                    </div>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center'>
                            <input id="react-checkbox-list" type="checkbox" value="" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                                checked={checkedTradeUnions}
                                onChange={(e) => {
                                    setCheckedTradeUnions(e.target.checked);
                                    if (e.target.checked) setTradeUnions(0);
                                }}
                            />
                            <label htmlFor="rate" className='mr-2'>Składki związkowe [%]: </label>
                        </div>

                        <input type="number" step="0.01"  name="rate" min="0" max="100" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={tradeUnions} onChange={(e) => setTradeUnions(Number(e.target.value))} disabled={!checkedTradeUnions} />
                    </div>

                    <div className='flex justify-between'>
                        <label htmlFor="rate" className='mr-2'>Suma stałych dodatków [brutto zł]: </label>
                        <input type="number" step="0.01" name="rate" min="0" max="9999999" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={constAddons} onChange={(e) => setConstAddons(Number(e.target.value))} />
                    </div>
                    {mode === "monthly" ?
                        <div className='flex justify-between mt-4'>
                            <label htmlFor="rate" className='mr-2'>Inne dodatki w tym miesiącu [brutto zł]: </label>
                            <input type="number" name="rate" min="0" max="9999999" className='border-2 border-black rounded px-2 w-24 sm:w-32 md:w-40' value={otherAddons} onChange={(e) => setOtherAddons(Number(e.target.value))} />
                        </div>
                        :
                        null}

                    <button className='bg-blue-500 text-white px-4 py-2 rounded w-24 mt-8' type="submit">
                        Zapisz
                    </button>
                </form>
            </div>
        </div>
    );
};


export default UserSettings;