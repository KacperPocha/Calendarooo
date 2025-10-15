import axios from 'axios'
import React, { useEffect, useState } from 'react'


export const SalaryCalc = ({ workHoursInfo, daysArray, userSetting, setIsPopUpOpen, setMode, mode }) => {
  const [workHours, setWorkHours] = useState([])
  const [settings, setSettings] = useState({})
  const [rate, setRate] = useState(0)
  const [daysArrayParent, setDaysArray] = useState([])
  const [hoursToComplete, setHoursToComplete] = useState(0)
  const totalHours = (Object.values(workHours).reduce((sum, value) => sum + value, 0))
  const stawkaBruttoMies = Math.round((settings?.rate / (hoursToComplete / totalHours)) * 100) / 100
  const stawkaBruttoGodz = Math.round(settings?.rate * totalHours)

    useEffect(() => {
    setSettings(userSetting)
  }, [userSetting])

 useEffect(() => {
    setDaysArray(daysArray)
    const workDays = daysArray.filter(day => !day.isOtherMonth && !day.isWeekend && !day.isHoliday).length
    setHoursToComplete(workDays * 8)
  }, [daysArray])

  useEffect(() => {
    setWorkHours(workHoursInfo)
  }, [workHoursInfo])


 


  return (
    <div className='w-full mt-24'>
      <div className='grid justify-items-center'>
        <div className="mb-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => { setIsPopUpOpen(true); setMode("monthly") }}
          >
            Edytuj dane dla tego miesiąca
          </button>
        </div>
        <div className='mt-4 grid grid-col justify-items-center'>
          <label htmlFor="hours" className='mb-2'>Dni roboczych: </label>
          <input name='hours' type="text" value={hoursToComplete / 8} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col justify-items-center'>
          <label htmlFor="hours" className='mb-2'>Godzin do wyrobienia: </label>
          <input name='hours' type="text" value={hoursToComplete} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col justify-items-center text-center'>
          <label htmlFor="hours" className='mb-2'>Suma godzin przepracowanych:</label>
          <input name='hours' type="text" value={totalHours} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col justify-items-center text-center'>
          <label htmlFor="hours" className='mb-2'>Podstawa stawki brutto:</label>
          <input name='hours' type="text" value={settings?.rateType === undefined ? "0 zł" : settings?.rateType === "hour" ? settings?.rate + ' zł/h' : settings?.rate + ' zł'} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col'>
          <label htmlFor="hours" className='mb-2'>Stawka brutto:</label>
          <input name='hours' type="text" value={settings?.rateType === NaN ? "0 zł" : settings?.rateType === "hour" ? stawkaBruttoGodz + ' zł' : stawkaBruttoMies + ' zł'} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col'>
          <label htmlFor="hours" className='mb-2'>Stawka netto:</label>
          <input name='hours' type="text" className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
      </div>
    </div>
  )
}
