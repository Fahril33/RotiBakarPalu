import {
  allStocksData,
  allSalesData,
  allPredictionDataByDate,
} from "../../../data/allData";
import { updateSoldStockData } from "../../../data/utils/stockHandler";
import { datePickerValue } from "../datePicker";
import {
  holidayIconMap,
  holidaysIconMap,
  weatherIconMap,
  weekendIconMap,
} from "../icons";

export async function displayerSold() {
  const totalStock = (await allStocksData()).totalStock;
  const spoiledStock = (await allStocksData()).spoiledStock;
  const stockData = totalStock - spoiledStock
  const nowRemainingStock = (await allStocksData()).remainingStock;
  const salesData = (await allSalesData()).soldTotal;
  let remainingStock = stockData - salesData;
  // console.log("stockdata", (await allStocksData()).totalStock);
  // console.log("rstock", remainingStock);

  const soldElement = document.querySelector("#soldCount");
  soldElement.textContent = `Terjual ${salesData}/${stockData}`;

  const dateValue = (await datePickerValue()).dateValue;

  if (nowRemainingStock != remainingStock) {
    await updateSoldStockData(salesData, remainingStock, dateValue);
  } else {
    // console.log("data sama aja");
  }
}

export async function displayerIncome() {
  const salesData = await allSalesData();
  const incomeElement = document.querySelector("#incomeCount");
  incomeElement.textContent = `Penjualan : ${salesData.incomeTotal.toLocaleString(
    "id-ID"
  )}`;
}

export async function displayerWeather() {
  const dateValue = (await datePickerValue()).dateValue;
  const todayWeather = (await allPredictionDataByDate(dateValue)).cuaca;
  const tomorrowWeather = (await allPredictionDataByDate(dateValue)).cuacaBesok;

  // Menentukan ikon cuaca hari ini
  const todayWeatherIcon =
    weatherIconMap[todayWeather] || weatherIconMap["unknown"];
  const todayWeatherIconElement = document.querySelector(
    'img[alt="weatherIcon"]'
  );
  todayWeatherIconElement.src = todayWeatherIcon;

  // Menentukan ikon cuaca besok
  const tomorrowWeatherIcon =
    weatherIconMap[tomorrowWeather] || weatherIconMap["unknown"];
  const tomorrowWeatherIconElement = document.querySelector(
    'img[alt="tomorowWeatherIcon"]'
  );
  tomorrowWeatherIconElement.src = tomorrowWeatherIcon;

  // Menampilkan deskripsi cuaca
  const todayWeatherText = document.querySelector("#todayWeather");
  todayWeatherText.textContent = `${todayWeather}`;

  const tomorrowWeatherText = document.querySelector("#tomorrowWeather");
  tomorrowWeatherText.textContent = `${tomorrowWeather}`;
}

export async function displayerHolidays() {
  const dateValue = (await datePickerValue()).dateValue;
  let weekEndValue = (await allPredictionDataByDate(dateValue)).weekend;
  let liburValue = (await allPredictionDataByDate(dateValue)).libur;
  // let liburValue = true;
  let rayaValue = (await allPredictionDataByDate(dateValue)).raya;
  console.log("WR", weekEndValue, rayaValue, liburValue);

  if (liburValue) {
    const weekendIcon = holidayIconMap[liburValue] || weekendIconMap["unknown"];
    const todayWeekendStatus = document.querySelector('img[alt="weekendIcon"]');
    todayWeekendStatus.src = weekendIcon;
  } else {
    const weekendIcon =
      weekendIconMap[weekEndValue] || weekendIconMap["unknown"];
    const todayWeekendStatus = document.querySelector('img[alt="weekendIcon"]');
    todayWeekendStatus.src = weekendIcon;
    //
  }

  const holidaysIcon = holidaysIconMap[rayaValue] || holidayIconMap["unknown"];
  const todayHolidayStatus = document.querySelector('img[alt="eventIcon"]');
  todayHolidayStatus.src = holidaysIcon;

  if (weekEndValue === "" || weekEndValue === "none") {
    weekEndValue = "unknown";
  } else if (liburValue) {
    weekEndValue = "Hari Libur";
  } else if (weekEndValue === true) {
    weekEndValue = "Weekend";
  } else if (weekEndValue === false) {
    weekEndValue = "Weekday";
  }

  if (rayaValue === "untracked") {
    rayaValue = "unknown";
  } else if (rayaValue === "" || rayaValue === "none") {
    rayaValue = "Hari Biasa";
  }

  showHolidaysData(weekEndValue, rayaValue);
}

function showHolidaysData(week, raya) {
  const todayWeekStatus = document.querySelector("#weekend");
  todayWeekStatus.textContent = `${week}`;

  const todayHolidayText = document.querySelector("#rayaEvent");
  todayHolidayText.textContent = `${raya}`;
}

export async function displayerPredictionData() {
  const dateValue = (await datePickerValue()).dateValue;
  let todayPredData = (await allPredictionDataByDate(dateValue)).hasilPrediksi;

  const todayPredictionText = document.querySelector("#todayPredictionResult");
  if (todayPredData === "none" || todayPredData === "") {
    todayPredictionText.textContent = `Tidak ada data hari ini`;
  } else {
    todayPredictionText.textContent = `Prediksi penjualan hari ini : ${todayPredData}`;
  }
}
