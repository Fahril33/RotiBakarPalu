import axios from "axios";
import { putPredictionData } from "../../../data/utils/predictionHandler";

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

  const startDate = new Date("2024-12-01");
  const endDate = new Date("2025-01-07");
  const result = jsonData
    .filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    })
    .map((item) => ({
      date: item.date,
      prediction: item.hasil_prediksi,
      terjual: item.terjual,
      weekend: item.weekend,
      libur: item.libur,
      event_raya: item.event_raya,
      cuaca: item.cuaca,
    }));
  const resultSales = jsonDataSales
    .filter((item) => {
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    })
    .map((item) => ({
      date: item.date,
      soldQty: item.totalQuantity,
    }));

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

    const dataTest = {
      weekend: weekend,
      libur: libur,
      cuaca: cuaca,
      event_raya: event_raya,
    };

    // Cek prediksi
    const predResult = await predictSales(dataTest);
    console.log("res", predResult);
    // Cek akurat
    let akurat = terjual === predResult[0] ? true : false;

    const updatedData = {
      hasil_prediksi: predResult[0],
      akurat: akurat
    };
    
    try {
      console.log(`updatedData ${date}:\n`, updatedData);
      
      console.log("========...Uploading...");
      await putPredictionData(updatedData, date);
    } catch (error) {
      console.error("Failed to put prediction data:", error);
    }
    console.log('Uploaded.', date);


    // Find the corresponding sold quantity for the date
    const soldQty = resultSales.find(
      (salesItem) => salesItem.date === date
    ).soldQty;

    output.push({
      date: date,
      sold: terjual,
      res: predResult[0],
      akurat: akurat,
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
  output.sort((a, b) => a.akurat - b.akurat);
  console.log("final output", output);
}

export async function predictSales(newData) {
  try {
    const response = await axios.post("http://127.0.0.1:7000/predict", newData);
    // console.log('res', response.data.prediction[0]);
    return response.data.prediction; // Assuming the prediction result is in the response.data.prediction
  } catch (error) {
    if (error.response) {
      console.error("Server Error:", error.response.data);
    } else if (error.request) {
      console.error("Failed to fetch data:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    throw error; // Rethrow the error to handle it in the calling function
  }
}
