import axios from 'axios'
import React, { useEffect, useState } from 'react'


export const SalaryCalc = ({ workHoursInfo, daysArray, userSetting, setIsPopUpOpen, setMode, rawData }) => {
  const [workHours, setWorkHours] = useState([])
  const [settings, setSettings] = useState({})
  const [daysArrayParent, setDaysArray] = useState([])
  const [hoursToComplete, setHoursToComplete] = useState(0)
  const totalHours = (Object.values(workHours).reduce((sum, value) => sum + value, 0))
  const totalRegularHours = rawData.reduce(
    (sum, day) => sum + (day.godzinyPrzepracowane || 0),
    0
  )
  const totalNightHours = rawData.reduce(
    (sum, day) => sum + (day.godzinyNocne || 0),
    0
  )
  const totalOvertime50 = rawData.reduce(
    (sum, day) => sum + (day.nadgodziny50 || 0),
    0
  )
  const totalOvertime100 = rawData.reduce(
    (sum, day) => sum + (day.nadgodziny100 || 0),
    0
  )
  const totalOvertime50Night = rawData.reduce(
    (sum, day) => sum + (day.nadgodziny50Nocne || 0),
    0
  )
  const totalOvertime100Night = rawData.reduce(
    (sum, day) => sum + (day.nadgodziny100Nocne || 0),
    0
  )

  const stawkaBruttoMies = isNaN(settings?.rate)
    ? "0"
    : (
      (
        (totalRegularHours +
          totalOvertime50 * 1.5 +
          totalOvertime100 * 2 +
          (totalNightHours * (settings?.nightAddon + 100)) / 100 +
          (totalOvertime50Night * 1.5 * (settings?.nightAddon + 100)) / 100 +
          (totalOvertime100Night * 2 * (settings?.nightAddon + 100)) / 100
        ) * settings?.rate
      ) / hoursToComplete +
      (settings?.constAddons || 0) +
      (settings?.otherAddons || 0)
    ).toFixed(2);

  const stawkaBruttoGodz = isNaN(settings?.rate)
    ? "0"
    : (
      (
        (totalRegularHours +
          totalOvertime50 * 1.5 +
          totalOvertime100 * 2 +
          (totalNightHours * (settings?.nightAddon + 100)) / 100 +
          (totalOvertime50Night * 1.5 * (settings?.nightAddon + 100)) / 100 +
          (totalOvertime100Night * 2 * (settings?.nightAddon + 100)) / 100
        ) * settings?.rate
      ) +
      (settings?.constAddons || 0) +
      (settings?.otherAddons || 0)
    ).toFixed(2);

  const totalGross = settings?.rateType === "hour" ? stawkaBruttoGodz : stawkaBruttoMies

  const zus_emerytalna = totalGross * 0.0976;
  const zus_rentowa = totalGross * 0.015;
  const zus_chorobowa = totalGross * 0.0245;
  const suma_ZUS = zus_emerytalna + zus_rentowa + zus_chorobowa;
  const zdrowotna = (totalGross - suma_ZUS) * 0.09;
  const KUP = 250;
  const podstawaPIT = totalGross - suma_ZUS - KUP;

  const ulgiZwolnione = ["mlody", "emeryt", "powrot", "rodzina4plus"];
  let PIT = 0;
  if (settings?.taxReliefType === "brak") {
    PIT = podstawaPIT * 0.12 - 300;

  } else if (ulgiZwolnione.includes(settings.taxReliefType)) {
    PIT = 0;
  }
  if (PIT < 0) PIT = 0;


  const skladkaPPK = totalGross * settings?.PPK / 100;
  const skladkaZwiazek = totalGross * settings?.tradeUnions / 100;
  const netto = (totalGross - suma_ZUS - zdrowotna - PIT - skladkaPPK - skladkaZwiazek).toFixed(2);



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
    <div className='w-full mt-4'>
      <div className='grid justify-items-center'>
        <div>
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
          <label htmlFor="hours" className='mb-2'>Dodatki:</label>
          <input name='hours' type="text" value={(isNaN(settings?.otherAddons) || isNaN(settings?.constAddons)) ? "0 zł" : settings?.otherAddons + settings?.constAddons + ' zł'} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col'>
          <label htmlFor="hours" className='mb-2'>Stawka brutto:</label>
          <input name='hours' type="text" value={settings?.rateType === NaN ? "0 zł" : settings?.rateType === "hour" ? stawkaBruttoGodz + ' zł' : stawkaBruttoMies + ' zł'} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
        <div className='mt-4 grid grid-col'>
          <label htmlFor="hours" className='mb-2'>Stawka netto:</label>
          <input name='hours' type="text" value={isNaN(netto) ? "0 zł" : netto} className='bg-slate-300 p-1 text-center text-2xl w-32' disabled />
        </div>
      </div>
    </div>
  )
}
