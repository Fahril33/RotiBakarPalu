import API_ENDPOINT from "../../config/config";
// import { catchQtySold } from "../../scripts/utils/python/predict";
import { allPredictionDataByDate, allSalesDataByDate } from "../allData";
import { isWeekend } from "./holidayHandler";
import { stockConverter } from "./stockHandler";

export async function postPredictionData(predictionData) {
  try {
    const response = await fetch(`${API_ENDPOINT.PREDICTION}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predictionData),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Ambil teks kesalahan
      throw new Error(
        `Gagal menyimpan data prediction. Status: ${response.status}, Message: ${errorText}`
      );
    }
    const data = await response.json();
    console.log("Data prediction berhasil disimpan melalui POST:", data);
  } catch (error) {
    console.error(
      "Terjadi kesalahan saat melakukan POST data prediction:",
      error
    );
  }
}

export async function putPredictionData(predictionData, date) {
  //   console.log("fidata", date, ":", predictionData);
  try {
    const response = await fetch(`${API_ENDPOINT.PREDICTION}/date/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(predictionData),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data prediction.");
    }
    console.log("Data prediction", date, "berhasil diperbarui melalui PUT.");
  } catch (error) {
    console.error(
      "Terjadi kesalahan saat melakukan PUT data prediction:",
      error
    );
  }
}

export async function deletePredictionData(date) {
  try {
    const response = await fetch(`${API_ENDPOINT.PREDICTION}/date/${date}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete prediction data with date ${date}.`);
    }

    const result = await response.json();
    console.log("prediction data successfully deleted:", result);
  } catch (error) {
    console.error("An error occurred while deleting prediction data:", error);
  }
}

export async function isPredictionDataExist(date) {
  const isAnyToday = (await allPredictionDataByDate(date)).filteredData;
  const weekendValue = isWeekend(date);
  if (isAnyToday === `none`) {
    const PredictionData = {
      date: date,
      weekend: weekendValue,
      libur: false,
      cuaca: "",
      cuaca_besok: "",
      event_raya: "",
      terjual: "",
      manual_update: false,
      operasional: true,
      hasil_prediksi: "",
    };
    await postPredictionData(PredictionData);
    const newData = (await allPredictionDataByDate(date)).filteredData;
    console.log("Shell Prediction berhasil ditambahkan", newData);
  } else {
    console.log("shell prediction sudah ada", date, isAnyToday);
  }
}

export async function createNewPredictionDataShell(date) {
  const emptyData = {
    date: date,
    weekend: false,
    libur: false,
    cuaca: "",
    cuaca_besok: "",
    event_raya: "",
    terjual: "",
    manual_update: false,
    operasional: false,
    hasil_prediksi: "",
  };
  postPredictionData(emptyData);
  const newPredictionData = (await allPredictionDataByDate(date)).filteredData;
  console.log("shell predidct gaada, nih baru", newPredictionData);
}

export async function syncSoldToPrediction(date) {
  const jumlah = (await allSalesDataByDate(date)).soldTotal;
  const soldConvertedValue = await stockConverter(jumlah);

  // kebutuhan developing
  // const qty = catchQtySold(date);
  // console.log("qty", qty);
  // const newSoldConvertedValue = await newStockConverter(qty);
  const predicitionData = {
    terjual: soldConvertedValue,
    // newTerjual: newSoldConvertedValue,
  };

  let isPredictionShellAvailable = (await allPredictionDataByDate(date))
    .filteredData;
  if (isPredictionShellAvailable === `none`) {
    await isPredictionDataExist(date);
    console.log("shell predicition dibuat dibuat, lanjut put");
    await putPredictionData(predicitionData, date);
  } else {
    console.log("shell prediction sudah ada, skip ke put");
    await putPredictionData(predicitionData, date);
  }
}
