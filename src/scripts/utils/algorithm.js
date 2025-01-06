import API_ENDPOINT from "../../config/config";
import { allPredictionDataByDate } from "../../data/allData";
import { putPredictionData } from "../../data/utils/predictionHandler";
import { datePickerValue, getCurrentDate, getTomorrowDate } from "./datePicker";
import { showModal } from "./sales/modal-handler";

const C45 = require("c4.5");
const axios = require("axios");

async function fetchDataAndTrainModel(testData) {
  try {
    const response = await axios.get(API_ENDPOINT.PREDICTION);
    const allData = Array.isArray(response.data) ? response.data : [];

    if (allData.length === 0) {
      throw new Error("Data kosong atau tidak valid dari API.");
    }

    const filteredData = allData.filter(
      (item) => item.operasional === true && item.terjual !== ""
    );
    const wTinggi = allData.filter(
      (item) =>
        item.operasional === true &&
        item.terjual !== "" &&
        item.terjual === "tinggi" &&
        item.weekend === true &&
        item.libur === false &&
        item.cuaca === "mendung"
    );
    const wSedang = allData.filter(
      (item) =>
        item.operasional === true &&
        item.terjual !== "" &&
        item.terjual === "sedang" &&
        item.weekend === true &&
        item.libur === false &&
        item.cuaca === "mendung"
    );
    const wRendah = allData.filter(
      (item) =>
        item.operasional === true &&
        item.terjual !== "" &&
        item.terjual === "rendah" &&
        item.weekend === true &&
        item.libur === false &&
        item.cuaca === "mendung"
    );
    console.log("wRendah", wRendah);
    console.log("wSedang", wSedang);
    console.log("wTinggi", wTinggi);

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
    const target = 4;

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
          console.log("model", model);

          console.log("Model berhasil dibuat");

          try {
            const predictTodayData = model.classify(testData[0]);
            const predictTomorrowData = model.classify(testData[1]);

            console.log("Predict Today Raw:", predictTodayData);
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
  await putPredictionData(todayData, todayDate);
  // kalau bukan hari ini, jangan up prediksi besok

  const currDate = getCurrentDate().pickedDate;
  const pickedDate = (await datePickerValue()).dateValue;
  // console.log('tomorrowDate', tomorrowDate);

  if (currDate === pickedDate || pickedDate === null) {
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
            <option value="false">Tidak</option>
          </select>
        </div>
        <div class="form-group">
          <label for="todayLiburValue">Libur</label>
          <select id="todayLiburValue" name="liburValue">
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
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
      const hariRaya = modal.querySelector("#TodayEventRayaValue").value;
      const weekend = modal.querySelector("#todayWeekendValue").value;
      const libur = modal.querySelector("#todayLiburValue").value;
      // const features = ["event_raya", "weekend", "libur", "cuaca"];

      const dataTest = [
        [
          hariRaya,
          weekend === "true" ? true : false,
          libur === "true" ? true : false,
          cuaca,
        ],
        [
          hariRaya,
          weekend === "true" ? true : false,
          libur === "true" ? true : false,
          cuaca,
        ],
      ];
      // console.log("dataTest", dataTest);
      const catchedData = await fetchDataAndTrainModel(dataTest);
      // console.log("catchedData", catchedData);
      resultText.textContent = catchedData.predictTodayData;
      resultText.classList.add(catchedData.predictTodayData);
      predBtn.style.display = "grid";
      loadingComponent.style.display = "none";
    });

  // Tambahkan event listener untuk menutup modal
  modal.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
  });
}
