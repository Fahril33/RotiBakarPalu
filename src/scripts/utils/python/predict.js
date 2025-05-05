import axios from "axios";
import { putPredictionData } from "../../../data/utils/predictionHandler";
import RBPsource from "../../../data/source";
import Swal from "sweetalert2";

export async function predictMuch() {
  const response = await fetch("http://127.0.0.1:5000/api/prediction");
  const responseSales = await fetch("http://127.0.0.1:5000/api/sales");
  if (!response.ok) {
    console.log("Predict Server offline");
    throw new Error("Network response was not ok");
  }

  const allData = await response.json();
  const allDataSales = await responseSales.json();

  if (allData.length === 0) {
    throw new Error("Data kosong atau tidak valid dari API.");
  }
  if (allDataSales.length === 0) {
    throw new Error("Data Sales kosong atau tidak valid dari API.");
  }

  const jsonData = allData.filter(
    (item) => item.operasional === true && item.terjual !== ""
  );
  const jsonDataSales = allDataSales.filter((item) => item.totalQuantity !== 0);

  // const startDate = new Date("2024-10-01");
  // const endDate = new Date("2024-12-31");
  // const startDate = new Date("2023-11-08");
  // const endDate = new Date("2024-04-30");
  // const endDate = new Date("2024-12-31");
  // const startDate = new Date("2024-12-01");
  // const endDate = new Date("2025-01-07");
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-01-31");
  const result = jsonData
    .filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    })
    .map((item) => ({
      date: item.date,
      prediction: item.hasil_prediksi,
      terjual: item.terjual,
      cuaca: item.cuaca,
      weekend: item.weekend,
      libur: item.libur,
      event_raya: item.event_raya,
    }));

    
  const sortedResultByWeather = result.sort((a, b) =>
    a.cuaca.localeCompare(b.cuaca)
  );
  console.log("sortedData", sortedResultByWeather);

  const resultSales = jsonDataSales
    .filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    })
    .map((item) => ({
      date: item.date,
      soldQty: item.totalQuantity,
    }));
// ?
  console.log("sales qty data", resultSales);

  console.log("mapped data", result.length);
  // console.log('mapped data', result);
  let output = [];
  for (const item of result) {
    const date = item.date;
    const terjual = item.terjual;
    const weekend = item.weekend;
    const libur = item.libur;
    const event_raya = item.event_raya;
    const cuaca = item.cuaca;

    const eventRayaConverted = event_raya === "" ? "none" : event_raya;
    console.log("beforeConverted", event_raya);
    console.log("afterConverted", eventRayaConverted);

      const dataTest = {
        weekend: weekend,
        libur: libur,
        cuaca: cuaca,
        event_raya: eventRayaConverted,
      };

      // console.log('dataTest', dataTest);

    // Cek prediksi
    const predResult = await predictSales(dataTest);
    // console.log("res", predResult);
    // Cek akurat
    let akurat = terjual === predResult ? true : false;

    const updatedData = {
      hasil_prediksi: predResult,
      akurat: akurat,
    };

    try {
      // console.log(`updatedData ${date}:\n`, updatedData);
      // console.log("========...Uploading...");
      // await putPredictionData(updatedData, date);
    } catch (error) {
      console.error("Failed to put prediction data:", error);
    }
    console.log("Uploaded.", date);

    // Find the corresponding sold quantity for the date
    const soldQty = resultSales.find(
      (salesItem) => salesItem.date === date
    ).soldQty;

    output.push({
      date: date,
      res: predResult,
      akurat: akurat,
      sold: terjual,
      cuaca: cuaca,
      weekend: weekend,
      libur: libur,
      event_raya: eventRayaConverted,
      soldQty: soldQty,
    });
  }
  let akuratTrueCount = 0;
  let akuratFalseCount = 0;

  output.forEach((item) => {
    if (item.akurat) {
      akuratTrueCount++;
    } else {
      akuratFalseCount++;
    }
  });

  console.log(`Akurat True Count: ${akuratTrueCount}`);
  console.log(`Akurat False Count: ${akuratFalseCount}`);
  const totalPredictions = output.length;
  console.log("total Predictions", totalPredictions);
  const accuracyPercentage = (akuratTrueCount / totalPredictions) * 100;

  console.log(`Persentase Akurat: ${accuracyPercentage.toFixed(2)}%`);
  output.sort((a, b) => a.akurat - b.akurat);
  console.log("final output", output);

  const cuaca = output.filter(item => item.cuaca === 'hujan');
  console.log("hujan:", cuaca);
  
  console.log('===================', );

  function filterData(terjual, akurat) {
    return output.filter(
      (item) =>
        // item.operasional === true &&
        new Date(item.date) >= new Date("2024-10-01") &&
        new Date(item.date) <= new Date("2025-01-31") &&
        item.sold === terjual &&
        // item.hasil_prediksi === "tinggi" &&
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

  const tinggiTrue = filterData("tinggi", true);
  console.log("tinggi true", tinggiTrue.length);
}

export async function predictSales(newData) {
  try {

    console.log("dataToPred", newData);
    console.log('nd', newData.libur);
    // const allData = await RBPsource.getPredictions()
    // console.log('allPredData', allData);

    // const weekendConverted = newData.weekend === "true" ? true : false
    // const liburConverted = newData.libur === "true" ? true : false

    // const filteredData = allData
    //   .filter(
    //     (item) =>
    //       item.operasional === true &&
    //       item.cuaca === newData.cuaca &&
    //       item.weekend == weekendConverted &&
    //       item.event_raya === newData.event_raya &&
    //       item.libur == liburConverted &&
    //       new Date(item.date) >= new Date("2023-10-01") &&
    //       new Date(item.date) <= new Date("2024-04-31")
    //   )
    //   .map((item) => ({
    //     terjual: item.terjual,
    //     cuaca: item.cuaca,
    //     weekend: item.weekend,
    //     event_raya: item.event_raya,
    //     libur: item.libur,
    //     date: item.date,
    //   }));
    // console.log("filteredDataTrained", filteredData);

    const response = await axios.post(`http://127.0.0.1:7000/predict`, newData);
    console.log('response:', response.data.prediction[0]);
    return response.data.prediction[0]; // Assuming the prediction result is in the response.data.prediction
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      console.error("Failed to fetch data:", error.request);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Bagian server prediksi sedang bermasalah!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
    } else {
      console.error("Error:", error.message);
    }
    throw error; // Rethrow the error to handle it in the calling function
  }
}

export function catchQtySold(date) {
  const jsonData = require("./output.json");
  const filteredData = jsonData.filter((item) => item.operasional === "true");
  const soldQty =
    filteredData.find((item) => item.date === date)?.sold_stock || 0;
  return soldQty;
}
