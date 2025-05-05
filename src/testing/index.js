import API_ENDPOINT from "../config/config";
import { testingPrediction } from "./dataTest";
import { testingFetchHolidays } from "./evetRaya";
import { testingDataPuasa } from "./isPuasa";
import { testingGetCuaca, testingSaveWeatherData } from "./weather";

export async function doTest() {
  // await testingGetCuaca()
  // await testingSaveWeatherData()
  // await testingFetchHolidays()
  // await testingDataPuasa()
  //   await testingPrediction();
  await dataToTest();
}

async function dataToTest() {
  const response = await fetch(API_ENDPOINT.PREDICTION);
  const allData = await response.json();

  const filteredDateRange = allData
    .filter(
      (item) =>
        // item.cuaca === "hujan" &&
        item.hasil_prediksi === "rendah" &&
        item.operasional === true &&
        new Date(item.date) >= new Date("2024-10-01") &&
        new Date(item.date) <= new Date("2025-01-31")
    )
    .map((item) => ({
      date: item.date,
      terjual: item.terjual,
      hasil_prediksi: item.hasil_prediksi,
      cuaca: item.cuaca,
      weekend: item.weekend,
      event_raya: item.event_raya,
      libur: item.libur,
      operasional: item.operasional,
      akurat: item.akurat,
    }));
  console.log("datas", filteredDateRange);
  console.log("datas", filteredDateRange.length);

  const trainingDataFiltered = allData
    .filter(
      (item) =>
        // item.cuaca === "hujan" &&
        item.terjual === "rendah" &&
        item.operasional === true &&
        new Date(item.date) >= new Date("2023-10-01") &&
        new Date(item.date) <= new Date("2024-04-31")
    )
    .map((item) => ({
      terjual: item.terjual,
      cuaca: item.cuaca,
      weekend: item.weekend,
      event_raya: item.event_raya,
      libur: item.libur,
      date: item.date,
    }));
  console.log("datasTraining", trainingDataFiltered);
  const sortedByCuacaAndWeekend = trainingDataFiltered.sort((a, b) => {
    const cuacaComparison = a.cuaca.localeCompare(b.cuaca);
    if (cuacaComparison !== 0) {
      return cuacaComparison;
    }
    return a.weekend - b.weekend;
  });
  console.log("sortedByCuacaAndWeekend", sortedByCuacaAndWeekend);
  console.log("datasTraining", trainingDataFiltered.length);

  function filterData(terjual, akurat) {
    return allData.filter(
      (item) =>
        item.operasional === true &&
        new Date(item.date) >= new Date("2024-10-01") &&
        new Date(item.date) <= new Date("2025-01-31") &&
        // item.terjual === terjual &&
        item.hasil_prediksi === terjual &&
        item.akurat === akurat
    );
  }

  //
  const rendahFalse = filterData("rendah", false);
  console.log("rendah false", rendahFalse.length);
  console.log("rendah false", rendahFalse);

  const rendahTrue = filterData("rendah", true);
  console.log("rendah true", rendahTrue.length);
  //
  const sedangFalse = filterData("sedang", false);
  console.log("sedang false", sedangFalse.length);

  const sedangTrue = filterData("sedang", true);
  console.log("sedang true", sedangTrue.length);
  //
  const tinggiFalse = filterData("tinggi", false);
  console.log("tinggi false", tinggiFalse.length);
  console.log("tinggi false", tinggiFalse);

  const tinggiTrue = filterData("tinggi", true);
  console.log("tinggi true", tinggiTrue.length);
}
