// prediction-modal.js
import Swal from "sweetalert2";
import {
  allPredictionDataByDate,
  allStockDataByDate,
} from "../../../data/allData";
import RBPsource from "../../../data/source";
import {
  isPredictionDataExist,
  putPredictionData,
} from "../../../data/utils/predictionHandler";
import { putNewStockData } from "../../../data/utils/stockHandler";
import { usePrediction } from "../algorithm";
import { datePickerValue } from "../datePicker";
import {
  displayerHolidays,
  displayerPredictionData,
  displayerWeather,
} from "./displayerData";
import { showModal, closeModal } from "./modal-handler";

export async function showPredictionModal() {
  const pickedDate = (await datePickerValue()).dateValue;
  const { cuaca, raya, akurat, operasional } = await allPredictionDataByDate(
    pickedDate
  );
  const spoiledStock = (await allStockDataByDate(pickedDate)).spoiledStock;
  // console.log("spoiledStock", spoiledStock);
  const userRole = await RBPsource.getUserData();
  // console.log("userRole", userRole.role);

  let operasionalBoolean;
  if (operasional === true) {
    operasionalBoolean = "Buka";
  } else if (operasional === false) {
    operasionalBoolean = "Tutup";
  } else {
    operasionalBoolean = null; // Jika nilainya "null" atau "none"
  }

  const modalContent = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Edit Data Prediksi & Stok</h2>
      <form id="predictionForm">
        <div class="form-group">
          <label for="todayDate">Tanggal</label>
          <input type="text" id="todayDate" name="todayDate" value="${pickedDate}" disabled/>
        </div>
        <div class="form-group">
          <label for="todayOperasionalEmployee">Operasional</label>
          <input type="text" id="todayOperasionalEmployee" name="todayOperasional" value="${operasionalBoolean}" disabled style="display: block"/>
          <select id="todayOperasionalManager" name="todayOperasional" 
            ${
              userRole.role === "employee" ? `disabled` : ""
            } style="display: none"
          >
            <option value="null" ${
              operasional === null || operasional === "none" ? "selected" : ""
            }>None</option>
            <option value="true" ${
              operasional === true ? "selected" : ""
            }>Buka</option>
            <option value="false" ${
              operasional === false ? "selected" : ""
            }>Tutup</option>
          </select>
        </div>
        <div class="form-group">
          <label for="todayWeatherValue">Cuaca</label>
          <select id="todayWeatherValue" name="weatherValue">
            <option value="unknown" ${
              cuaca === "unknown" ? "selected" : ""
            }>Unknown</option>
            <option value="cerah" ${
              cuaca === "cerah" ? "selected" : ""
            }>Cerah</option>
            <option value="mendung" ${
              cuaca === "mendung" ? "selected" : ""
            }>Mendung</option>
            <option value="hujan" ${
              cuaca === "hujan" ? "selected" : ""
            }>Hujan</option>
          </select>
        </div>
        <div class="form-group">
          <label for="TodayEventRayaValue">Event / Raya</label>
          <select id="TodayEventRayaValue" name="eventRayaValue">
            <option value="" ${raya === "" ? "selected" : ""}>None</option>
            <option value="puasa" ${
              raya === "puasa" ? "selected" : ""
            }>Puasa</option>
            <option value="Hari Raya Natal" ${
              raya === "Hari Raya Natal" ? "selected" : ""
            }>Hari Raya Natal</option>
            <option value="Hari Raya Idul Adha" ${
              raya === "Hari Raya Idul Adha" ? "selected" : ""
            }>Hari Raya Idul Adha</option>
            <option value="Hari Raya Idul Fitri" ${
              raya === "Hari Raya Idul Fitri" ? "selected" : ""
            }>Hari Raya Idul Fitri</option>
            <option value="Tahun Baru Masehi" ${
              raya === "Tahun Baru Masehi" ? "selected" : ""
            }>Tahun Baru Masehi</option>
            <option value="Tahun Baru Imlek" ${
              raya === "Tahun Baru Imlek" ? "selected" : ""
            }>Tahun Baru Imlek</option>
          </select>
        </div>
        <div class="form-group" >
          <label for="todayAkurat">Akurat</label>
          <select id="todayAkurat" name="todayAkurat" 
            ${operasional === false || operasional === null ? `disabled` : ""}
          >
            <option value="null" ${
              akurat === null || akurat === "none" ? "selected" : ""
            }>
            ${
              operasional === false || operasional === null
                ? `Operasional Tutup`
                : "None"
            }</option>
            <option value="true" ${
              akurat === true ? "selected" : ""
            }>Ya</option>
            <option value="false" ${
              akurat === false ? "selected" : ""
            }>Tidak</option>
          </select>
          <span class="error" id="akuratError">Data akurat hanya bisa diubah jika outlet buka.</span>
        </div>
        <div class="form-group">
          <label for="todaySpoiledStock">Roti rusak</label>
          <input type="number" id="todaySpoiledStock" name="todaySpoiled" min="0" value="${spoiledStock}" />
        </div>
        <div class="form-group">
          <span class="error" id="dateError" style="font-size: medium; text-align: center;">Oops! Masa depan begitu menarik.</span>
          <button type="submit" id="predBtn">Update</button>
        </div>
        
      </form>
    </div>
  `;

  const modal = showModal(modalContent);

  modal
    .querySelector("#todayOperasionalManager")
    .addEventListener("change", function () {
      const todayAkurat = modal.querySelector("#todayAkurat");
      // Periksa nilai yang dipilih
      if (this.value === "true") {
        // Jika "Buka" dipilih
        todayAkurat.disabled = false;
        todayAkurat.options[0].textContent = "None"; // Ubah teks opsi pertama
      } else {
        // Jika "Tutup" atau "None" dipilih
        todayAkurat.disabled = true;
        todayAkurat.options[0].textContent =
          operasional === false || operasional === null
            ? "Operasional Tutup"
            : "None";
        todayAkurat.options[0].selected = true;
      }
    });

  if (userRole.role === "manager") {
    modal.querySelector("#todayOperasionalManager").style.display = "block";
    modal.querySelector("#todayOperasionalEmployee").style.display = "none";
  } else {
    modal.querySelector("#todayOperasionalManager").style.display = "none";
    modal.querySelector("#todayOperasionalEmployee").style.display = "block";
  }

  // Handle form submission
  modal
    .querySelector("#predictionForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedWeatherValue =
        modal.querySelector("#todayWeatherValue").value;
      const updatedEventRaya = modal.querySelector(
        "#TodayEventRayaValue"
      ).value;
      const updatedSpoiledStock =
        modal.querySelector("#todaySpoiledStock").value;
      const updatedAkurat = modal.querySelector("#todayAkurat").value;
      console.log("updatedAkurat", updatedAkurat);
      const updatedOperasional = modal.querySelector(
        "#todayOperasionalManager"
      ).value;

      // 


      let akuratBoolean;
      if (updatedAkurat === "true") {
        akuratBoolean = true;
      } else if (updatedAkurat === "false") {
        akuratBoolean = false;
      } else {
        akuratBoolean = null; // Jika nilainya "null" atau "none"
      }

      let updatedOperasionalBoolean;
      if (updatedOperasional === "true") {
        updatedOperasionalBoolean = true;
      } else if (updatedOperasional === "false") {
        updatedOperasionalBoolean = false;
      } else {
        updatedOperasionalBoolean = false;
      }

      // console.log("sama", updatedOperasional, operasional);

      let updatedData;
      if (userRole.role === "employee" && operasional === false) {
        updatedData = {
          cuaca: updatedWeatherValue,
          event_raya: updatedEventRaya,
          manual_update: true,
        };
      } else if (userRole.role === "employee" && operasional === true) {
        updatedData = {
          cuaca: updatedWeatherValue,
          event_raya: updatedEventRaya,
          manual_update: true,
          akurat: akuratBoolean,
        };
      } else {
        if (updatedOperasionalBoolean === operasional) {
          updatedData = {
            cuaca: updatedWeatherValue,
            event_raya: updatedEventRaya,
            manual_update: true,
            akurat: akuratBoolean,
          };
        } else {
          updatedData = {
            operasional: updatedOperasionalBoolean,
            cuaca: updatedWeatherValue,
            event_raya: updatedEventRaya,
            manual_update: true,
            akurat: akuratBoolean,
          };
        }
      }

      document.getElementById("akuratError").style.display = "none";
      if (updatedOperasionalBoolean === false && akuratBoolean === true) {
        document.getElementById("akuratError").style.display = "inline";
        return;
      }

      const pickedDate = (await datePickerValue()).dateValue;

      // Create Date objects for comparison
      const pickedDateObj = new Date(pickedDate);
      const currDate = new Date();

      // Set both dates to midnight to compare just the dates
      pickedDateObj.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      // Get date 1 days before current date
      const oneDaysAgo = new Date(currDate);
      oneDaysAgo.setDate(currDate.getDate() - 1);

      const oneDaysAhead = new Date(currDate);
      oneDaysAhead.setDate(currDate.getDate() + 1);

      if (pickedDateObj > oneDaysAhead) {
        document.getElementById("dateError").style.display = "block";
        document.getElementById("predBtn").style.display = "none";
        return;
      } else if (pickedDateObj < oneDaysAgo) {
        document.getElementById("predBtn").style.display = "none";
        if (userRole.role === "employee") {
          Swal.fire({
            icon: "error",
            title: "Akses Terbatas",
            text: "Anda tidak memiliki akses untuk mengubah data prediksi hari ini",
            confirmButtonColor: "#3085d6",
          });
          return;
        }
      }

      // console.log("updatedData", updatedData);

      try {
        await isPredictionDataExist(pickedDate);
        await putPredictionData(updatedData, pickedDate);
        await putNewStockData(pickedDate, {
          spoiled_stock: updatedSpoiledStock,
        });

        // await displayerSold();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Data berhasil diperbarui.",
        });
        // Close the modal after submission
        closeModal(modal);
        await usePrediction(true);
        await displayerPredictionData();
        await displayerWeather();
        await displayerHolidays();
      } catch (error) {
        console.error("Error updating prediction data:", error);
      }
    });
}
