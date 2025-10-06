import axios from 'axios';
import React, { useEffect, useState } from 'react'

const UserSettings = ({ isOpen, onClose, userRate }) => {
    const [rate, setRate] = useState(0)
    const [rateType, setRateType] = useState(null)
    const [typeOfJobTime, setTypeOfJobTime] = useState(null)
    const [nightAddon, setNightAddon] = useState(0)
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        setRate(userRate)
    }, [userRate])

    const handleSubmit = async (e) => {


        const userID = localStorage.getItem("userID");

        try {
            const response = await axios.put(
                `http://localhost:3000/api/updaterate/${userID}`,
                { rate: rate }
            );
            console.log(response.data.message);
            onClose();
        } catch (error) {
            console.error("Błąd podczas zapisywania stawki:", error);
        }
    };


    if (!isOpen) return null;


    console.log(nightAddon)

    return (
        <div
            className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"
            onClick={onClose}
        >
            <div
                className="flex flex-col bg-white rounded-lg shadow-lg p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end">
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
                        <ul class="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/1"}
                                        onChange={() => setTypeOfJobTime("1/1")}
                                    />
                                    <label for="vue-checkbox-list" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Pełny etat</label>
                                </div>
                            </li>
                            <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="react-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/2"}
                                        onChange={() => setTypeOfJobTime("1/2")}
                                    />
                                    <label for="react-checkbox-list" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">1/2 etatu</label>
                                </div>
                            </li>
                            <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={typeOfJobTime === "1/4"}
                                        onChange={() => setTypeOfJobTime("1/4")}
                                    />
                                    <label for="vue-checkbox-list" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">1/4 etatu</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className='mb-4'>
                        <ul class="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                            <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="vue-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={rateType === "month"}
                                        onChange={() => setRateType("month")}
                                    />
                                    <label for="vue-checkbox-list" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Stawka miesięczna</label>
                                </div>
                            </li>
                            <li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="react-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                                        checked={rateType === "hour"}
                                        onChange={() => setRateType("hour")}
                                    />
                                    <label for="react-checkbox-list" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Stawka godzinowa</label>
                                </div>
                            </li>
                        </ul>
                    </div>
                    {rateType === "month" ?
                        <div className='mb-4'>
                            <label htmlFor="rate" className='mr-2'>Stawka brutto [mieś.]: </label>
                            <input type="number" name="rate" className='border-2 border-black' value={rate} onChange={(e) => setRate(e.target.value)} />
                        </div>
                        :
                        <div className='mb-4'>
                            <label htmlFor="rate" className='mr-2'>Stawka brutto [/h]: </label>
                            <input type="number" name="rate" className='border-2 border-black' value={rate} onChange={(e) => setRate(e.target.value)} />
                        </div>
                    }
                    <div className='flex items-center'>
                        <input id="react-checkbox-list" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 mr-2"
                            checked={checked}
                            onChange={(e) => {
                                setChecked(e.target.checked);
                                if (e.target.checked) setNightAddon(0);
                            }}
                        />
                        <label htmlFor="rate" className='mr-2'>Dodatek Nocny [%]: </label>
                        <input type="number" name="rate" className='border-2 border-black' value={nightAddon} onChange={(e) => setNightAddon(e.target.value)} disabled={checked} />
                    </div>

                    <button className='bg-blue-500 text-white px-4 py-2 rounded w-24 mt-8' type="submit">
                        Zapisz
                    </button>
                </form>
            </div>
        </div>
    );
};


export default UserSettings;