import { allPredictionDataByDate } from "../../data/allData";
import { putPredictionData } from "../../data/utils/predictionHandler";
import { datePickerValue, getCurrentDate, getTomorrowDate } from "./datePicker";

const C45 = require("c4.5");
const axios = require("axios");

async function fetchDataAndTrainModel(testData) {
  try {
    const response = await axios.get("http://localhost:5000/api/prediction");
    const allData = Array.isArray(response.data) ? response.data : [];

    if (allData.length === 0) {
      throw new Error("Data kosong atau tidak valid dari API.");
    }

    const filteredData = allData.filter((item) => item.operasional === true);
    console.log(`Data training length: ${filteredData.length}`);
    const formattedData = filteredData.map((item) => [
      item.event_raya,
      item.weekend,
      item.libur,
      item.cuaca,
      item.terjual,
    ]);

    const features = ["event_raya", "weekend", "libur", "cuaca"];
    const featureTypes = ["category", "category", "category", "category"];
    const target = 3;

    const c45 = new C45();
    return new Promise((resolve, reject) => {
      c45.train(
        {
          data: formattedData,
          target: target,
          features: features,
          featureTypes: featureTypes,
        },
        (error, model) => {
          if (error) {
            reject("Error training the model:" + error);
            return;
          }

          const predictTodayData = model.classify(testData[0]);
          const predictTomorrowData = model.classify(testData[1]);

          resolve({
            predictTodayData,
            predictTomorrowData,
          });
        }
      );
    });
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

export async function usePrediction(customDate = false) {
  let currentDate;
  let tomorrowDate;
  let isCustom;

  console.log("customDate", !customDate);

  if (!customDate) {
    currentDate = getCurrentDate().pickedDate;
    tomorrowDate = getTomorrowDate().tomorrowDate;
    isCustom = false;
  } else {
    currentDate = (await datePickerValue()).dateValue;
    tomorrowDate = getTomorrowDate(true).tomorrowDate;
    isCustom = true;
  }

  // console.log("currentDate", currentDate);
  // console.log("tomorrowDate", tomorrowDate);

  const currentData = await allPredictionDataByDate(currentDate);
  const tomorrowData = await allPredictionDataByDate(tomorrowDate);
  const {
    raya: currentRaya,
    weekend: currentWeekend,
    libur: currentLibur,
    cuaca: currentCuaca,
  } = currentData;
  const {
    raya: tomorrowRaya,
    weekend: tomorrowWeekend,
    libur: tomorrowLibur,
    cuaca: tomorrowCuaca,
  } = tomorrowData;

  const processedCurrentRaya = currentRaya === "" ? "none" : currentRaya;
  const processedTomorrowRaya = tomorrowRaya === "" ? "none" : tomorrowRaya;

  const tesData = [
    [processedCurrentRaya, currentWeekend, currentLibur, currentCuaca],
    [processedTomorrowRaya, tomorrowWeekend, tomorrowLibur, tomorrowCuaca],
  ];

  console.log("tesData", tesData);

  try {
    const catchedData = await fetchDataAndTrainModel(tesData);
    // console.log("Prediksi Hari Ini:", catchedData.predictTodayData);
    // console.log("Prediksi Besok:", catchedData.predictTomorrowData);
    const resultToday = catchedData.predictTodayData;
    const resultTomorrow = catchedData.predictTomorrowData;
    await catchPrediction(resultToday, resultTomorrow, isCustom);
  } catch (error) {
    console.error("Error during prediction:", error);
  }
}

async function catchPrediction(resultToday, resultTomorrow, isCustom) {
  // console.log("RTD", resultToday);
  // console.log("RTM", resultTomorrow);
  let todayDate;
  let tomorrowDate;

  console.log("isCustoms", isCustom);

  if (!isCustom) {
    todayDate = getCurrentDate().pickedDate;
    tomorrowDate = getTomorrowDate().tomorrowDate;
  } else {
    todayDate = (await datePickerValue()).dateValue;
    tomorrowDate = getTomorrowDate(true).tomorrowDate;
  }
  const todayData = {
    hasil_prediksi: resultToday,
  };
  const tomorrowData = {
    hasil_prediksi: resultTomorrow,
  };
  await putPredictionData(todayData, todayDate);
  // kalau bukan hari ini, jangan up prediksi besok

  const currDate = getCurrentDate().pickedDate;
  const pickedDate = (await datePickerValue()).dateValue;
  
  if (currDate === pickedDate || pickedDate === null) {
    await putPredictionData(tomorrowData, tomorrowDate);
    console.log("pred besok jalan");
  }
}
