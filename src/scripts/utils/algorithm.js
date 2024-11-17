import {
  allFinanceDataByDate,
  allPredictionDataByDate,
} from "../../data/allData";
import { getCurrentDate, getTomorrowDate } from "./datePicker";

const C45 = require("c4.5");
const axios = require("axios");

async function fetchDataAndTrainModel(testData) {
  try {
    const response = await axios.get("http://localhost:4000/api/prediction");
    const allData = Array.isArray(response.data) ? response.data : [];

    if (allData.length === 0) {
      throw new Error("Data kosong atau tidak valid dari API.");
    }

    const filteredData = allData.filter((item) => item.operasional === true);
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

export async function usePrediction() {
  const currentDate = getCurrentDate().pickedDate;
  const tomorrowDate = getTomorrowDate().tomorrowDate;
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

  const tesData = [
    [currentRaya, currentWeekend, currentLibur, currentCuaca],
    [tomorrowRaya, tomorrowWeekend, tomorrowLibur, tomorrowCuaca],
  ];

  try {
    const catchedData = await fetchDataAndTrainModel(tesData);
    console.log("Prediksi Hari Ini:", catchedData.predictTodayData);
    console.log("Prediksi Besok:", catchedData.predictTomorrowData);
  } catch (error) {
    console.error("Error during prediction:", error);
  }
}
