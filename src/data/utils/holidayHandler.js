import { getCurrentDate, getTomorrowDate } from "../../scripts/utils/datePicker";
import { allPredictionDataByDate } from "../allData";
import { bacaHariLibur, getHolidays } from "../source";
import { postPredictionData, putPredictionData } from "./predictionHandler";

export async function getHolidayValue() {
  const currentDate = getCurrentDate().pickedDate
  const currentDaten = getCurrentDate().pickedDaten;
  const tomorrowDate = getTomorrowDate().tomorrowDate
  const tomorrowDaten = getTomorrowDate().pickedDaten
  try {
    const result = await getHolidays(currentDaten);
    console.log('hasil ini', result);
    if (result && result.liburValue !== undefined) {
      const resultValue = result.liburValue;

      await HolidayData(resultValue, currentDaten, currentDate);

      console.log("Libur Valuez:", resultValue);
    } else {
      console.error("Result is null or liburValue is not defined");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
  try {
    const result = await getHolidays(tomorrowDaten);
    console.log('hasil itu', result);
    if (result && result.liburValue !== undefined) {
      const resultValue = result.liburValue;

      await HolidayData(resultValue, tomorrowDaten, tomorrowDate);

      console.log("Libur Valuez:", resultValue);
    } else {
      console.error("Result is null or liburValue is not defined");
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

export function isWeekend(pickedDate) {
  // Mengubah string tanggal (YYYY-MM-DD) menjadi objek Date
  const dateParts = pickedDate.split("-");
  const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Bulan dimulai dari 0

  const day = dateObj.getDay(); // Mengambil hari dalam bentuk angka (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)

  // Mengembalikan true jika hari adalah Sabtu (6) atau Minggu (0)
  return day === 0 || day === 6;
}

async function HolidayData(rayaValue, daten, currentDate) {
  console.log("sss", rayaValue);

  //
  // cek shell, cek data, post/put
  //
  // const currentDate = getCurrentDate().pickedDate;
  const weekendValue = isWeekend(currentDate);
  const isTodayHoliday = await bacaHariLibur(daten);
  const liburValue = isTodayHoliday.isTodayHoliday;
  console.log("LIBURRR VALUE", liburValue);

  const isAnyToday = (await allPredictionDataByDate(currentDate)).filteredData;
  if (isAnyToday === `none`) {
    const weatherPredictionDataPost = {
      date: currentDate,
      weekend: weekendValue,
      libur: liburValue,
      cuaca: "",
      cuaca_besok: "",
      event_raya: rayaValue,
      terjual: "",
      manual_update: false,
      operasional: false,
      hasil_prediksi: "",
    };
    console.log("jalannya post lewat getholval");
    await postPredictionData(weatherPredictionDataPost);
  } else {
    const weatherPredictionDataPut = {
      weekend: weekendValue,
      libur: liburValue,
      event_raya: rayaValue,
      operasional: false,
    };
    await putPredictionData(weatherPredictionDataPut, currentDate);
  }
}

