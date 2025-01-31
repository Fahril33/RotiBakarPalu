import API_ENDPOINT from "../../config/config";
import { allPredictionDataByDate } from "../../data/allData";
import RBPsource from "../../data/source";
import { putPredictionData } from "../../data/utils/predictionHandler";
import { datePickerValue, getCurrentDate, getTomorrowDate } from "./datePicker";
import { showModal } from "./sales/modal-handler";

const C45 = require("c4.5");

// Fungsi untuk mengonversi data JSON ke CSV
function jsonToCsv(jsonData) {
  const parsedArray = [];
  // Menambahkan header
  const headers = ["event_raya", "weekend", "libur", "cuaca", "terjual"];
  parsedArray.push(headers);

  // Menambahkan data
  for (const row of jsonData) {
    const values = headers.map((header) => {
      // Mengonversi boolean ke string dan menangani nilai undefined
      if (header === "event_raya" && row[header] === "") {
        return "none"; // Ubah "" menjadi "none"
      }
      return row[header] === undefined ? "" : row[header].toString();
    });
    parsedArray.push(values);
  }

  return parsedArray;
}

async function fetchDataAndTrainModel(testData) {
  try {
    const response = await fetch(API_ENDPOINT.PREDICTION);
    // console.log("response", response);
    // const allData = Array.isArray(response.data) ? response.data : [];
    const allData = await response.json();
    // console.log("resson", allData);

    if (allData.length === 0) {
      throw new Error("Data kosong atau tidak valid dari API.");
    }

    const filteredData = allData.filter(
      (item) =>
        item.operasional === true &&
        item.terjual !== "" &&
        new Date(item.date) <= new Date("2024-12-30")
    );
    // const filteredData = allData.filter(
    //   (item) =>
    //     item.operasional === true &&
    //     item.terjual !== "" &&
    //     new Date(item.date) >= new Date("2024-10-01")
    // );
    // console.log("filteredDAta", filteredData);

    const data = jsonToCsv(filteredData);
    // console.log("dataNew", data

    const isData = allData.filter(
      (item) =>
        item.operasional === true &&
        item.terjual !== "" &&
        item.weekend === false &&
        item.libur === false &&
        item.cuaca === "mendung" &&
        item.event_raya === "puasa" 
    );
    console.log("isData", isData);

    var headers = Object.keys(data[0]);
    var features = headers.slice(0, -1); // Mengambil semua fitur kecuali kolom terakhir
    var featureTypes = headers.slice(0, -1).map(() => "category"); // Menyesuaikan tipe fitur secara otomatis
    var trainingData = data.map(function (row) {
      return features
        .map(function (feature) {
          return row[feature];
        })
        .concat(row[headers[headers.length - 1]]);
    });
    console.log("trainingData", trainingData.length);

    //  console.log('TD', trainingData);
    var target = headers[headers.length - 1]; // "class"
    var c45 = C45();

    return new Promise((resolve, reject) => {
      c45.train(
        {
          data: trainingData,
          target: target,
          features: features,
          featureTypes: featureTypes,
        },
        (error, model) => {
          if (error) {
            console.error("Training Error:", error);
            reject("Error training the model:" + error);
            return;
          }

          // Tambahkan pengecekan sebelum klasifikasi
          if (!model) {
            console.error("Model tidak terbentuk");
            reject("Model tidak terbentuk");
            return;
          }
          // console.log("model", model);
          // console.log("Model berhasil dibuat");

          try {
            // var testDataS = [
            //   ["none", "true", "true", "cerah"], // Ganti dengan nilai instance yang ingin diprediksi
            //   ["Tahun Baru Masehi", "2", "3", "cerah"],
            // ];
            // console.log("tesDatas[0]", testDataS[0]);
            // console.log("tesData[0]", testData[0]);
            // const predictTodayDatas = model.classify(testDataS[0]);
            const predictTodayData = model.classify(testData[0]);
            const predictTomorrowData = model.classify(testData[1]);

            console.log("Predict Today Raw:", predictTodayData);
            // console.log("Predict Today Raws:", predictTodayDatas);
            console.log("Predict Tomorrow Raw:", predictTomorrowData);

            resolve({
              predictTodayData,
              predictTomorrowData,
            });
          } catch (classifyError) {
            console.error("Klasifikasi Error:", classifyError);
            reject(classifyError);
          }
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
    console.log("false jalan");
  } else {
    currentDate = (await datePickerValue()).dateValue;
    tomorrowDate = getTomorrowDate(true).tomorrowDate;
    isCustom = true;
    console.log("true jalan");
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

  console.log("currentRaya", currentRaya);
  console.log("currentLibur", currentLibur);
  console.log("currweekend", currentWeekend);

  const processedCurrentRaya = currentRaya === "" ? "none" : currentRaya;
  const processedCurrentLibur = currentLibur === true ? "true" : "false";
  const processedCurrentWeekend = currentWeekend === true ? "true" : "false";
  const processedTomorrowRaya = tomorrowRaya === "" ? "none" : tomorrowRaya;
  const processedTomorrowLibur = tomorrowLibur === true ? "true" : "false";
  const processedTomorrowWeekend = tomorrowWeekend === true ? "true" : "false";

  const tesData = [
    [
      processedCurrentRaya,
      processedCurrentWeekend,
      processedCurrentLibur,
      currentCuaca,
    ],
    [
      processedTomorrowRaya,
      processedTomorrowWeekend,
      processedTomorrowLibur,
      tomorrowCuaca,
    ],
  ];

  // console.log("tesData", tesData);

  try {
    const catchedData = await fetchDataAndTrainModel(tesData);
    // console.log("Prediksi Hari Ini:", catchedData.predictTodayData);
    // console.log("Prediksi Besok:", catchedData.predictTomorrowData);
    const resultToday = catchedData.predictTodayData;
    console.log("resultToday", currentDate, resultToday);
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
    // console.log('tomorrowdate', tomorrowDate);
    console.log("false catch jalan");
  } else {
    todayDate = (await datePickerValue()).dateValue;
    tomorrowDate = getTomorrowDate(true).tomorrowDate;
    console.log("true catch jalan");
  }

  const todayData = {
    hasil_prediksi: resultToday,
  };
  console.log("today pred", todayData);
  const tomorrowData = {
    hasil_prediksi: resultTomorrow,
  };
  console.log("todayData", todayData);
  await putPredictionData(todayData, todayDate);
  // kalau bukan hari ini, jangan up prediksi besok

  const currDate = getCurrentDate().pickedDate;
  const pickedDate = (await datePickerValue()).dateValue;
  // console.log('tomorrowDate', tomorrowDate);

  if (currDate === pickedDate || pickedDate === null) {
    console.log("tomorrowData", tomorrowData);
    console.log("tomorrowDate", tomorrowDate);
    await putPredictionData(tomorrowData, tomorrowDate);
    // console.log("pred besok jalan");
  }
}

export async function manualPredictionModalHandler() {
  const modalContent = `
    <div class="modal-content" id="manualPredModal">
      <span class="close">&times;</span>
      <h2>Prediksi Manual</h2>
      <form id="manualPredDataForm">
        
        <div class="form-group">
          <label for="todayWeatherValue">Perkiraan cuaca</label>
          <select id="todayWeatherValue" name="weatherValue">
            <option value="cerah">Cerah</option>
            <option value="mendung">Mendung</option>
            <option value="hujan">Hujan</option>
          </select>
        </div>
        <div class="form-group">
          <label for="TodayEventRayaValue">Event / Raya</label>
          <select id="TodayEventRayaValue" name="eventRayaValue">
            <option value="none">None</option>
            <option value="puasa">Puasa</option>
            <option value="Hari Raya Natal">Hari Raya Natal</option>
            <option value="Hari Raya Idul Adha">Hari Raya Idul Adha</option>
            <option value="Hari Raya Idul Fitri">Hari Raya Idul Fitri</option>
            <option value="Tahun Baru Masehi">Tahun Baru Masehi</option>
            <option value="Tahun Baru Imlek">Tahun Baru Imlek</option>
          </select>
        </div>
        <div class="form-group">
          <label for="todayWeekendValue">Weekend</label>
          <select id="todayWeekendValue" name="weekendValue">
            <option value="true">Ya</option>
            <option value="false" selected>Tidak</option>
          </select>
        </div>
        <div class="form-group">
          <label for="todayLiburValue">Libur</label>
          <select id="todayLiburValue" name="liburValue">
            <option value="true">Ya</option>
            <option value="false" selected>Tidak</option>
          </select>
        </div>  
        
        <div class="form-group" id="predBtn">
          <button type="submit">Uji Data</button>
        </div> 
        <div id="loadingComponent" class="loader"></div>
        <div id="testDataResult" class="manualPrediction">
          <p>Hasil prediksi : </p>
          <p id="resultText" class="hasilManualPred"></p>
        </div>
      </form>
    </div>
    `;

  // Tampilkan modal dengan konten
  const modal = showModal(modalContent);

  document
    .getElementById("manualPredDataForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const predBtn = document.getElementById("predBtn");
      const loadingComponent = document.getElementById("loadingComponent");
      const resultText = modal.querySelector("#resultText");
      document.getElementById("testDataResult").style.display = "flex";

      predBtn.style.display = "none";
      loadingComponent.style.display = "block";
      resultText.className = "hasilManualPred";

      const cuaca = modal.querySelector("#todayWeatherValue").value;
      // console.log("Cuaca:", cuaca);
      const hariRaya = modal.querySelector("#TodayEventRayaValue").value;
      // console.log("Hari Raya:", hariRaya);
      const weekend = modal.querySelector("#todayWeekendValue").value;
      // console.log("Weekend:", weekend);
      const libur = modal.querySelector("#todayLiburValue").value;
      // console.log("Libur:", libur);

      const weekendConverted = weekend === "true" ? true : false;
      const liburConverted = libur === "true" ? true : false;

      const allPredictionData = await RBPsource.getPredictions();
      // console.log('allpredictiondata', allPredictionData);
      const isAnyTraining = allPredictionData.filter(
        (item) =>
          item.operasional === true &&
          item.terjual !== "" &&
          item.cuaca === cuaca &&
          item.event_raya === hariRaya &&
          item.weekend === weekendConverted &&
          item.libur === liburConverted
      );

      // console.log("filteredDataa", isAnyTraining);

      const dataTest = [
        [hariRaya, weekend, libur, cuaca],
        [hariRaya, weekend, libur, cuaca],
      ];
      // console.log("dataTest", dataTest);
      const catchedData = await fetchDataAndTrainModel(dataTest);
      console.log("catchedData", catchedData.predictTodayData);
      if (
        isAnyTraining.length < 1 &&
        catchedData.predictTodayData === "unknown"
      ) {
        resultText.textContent = "Data training belum ada.";
        console.log("data training tidak cukup");
      } else {
        resultText.textContent = catchedData.predictTodayData;
      }
      resultText.classList.add(catchedData.predictTodayData);
      predBtn.style.display = "grid";
      loadingComponent.style.display = "none";
    });

  // Tambahkan event listener untuk menutup modal
  modal.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
  });
}
