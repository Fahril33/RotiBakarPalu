// prediction-modal.js
import {
  allPredictionDataByDate,
  allStockDataByDate,
} from "../../../data/allData";
import { isPredictionDataExist, putPredictionData } from "../../../data/utils/predictionHandler";
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
  const cuaca = (await allPredictionDataByDate(pickedDate)).cuaca;
  const eventRaya = (await allPredictionDataByDate(pickedDate)).raya;
  const spoiledStock = (await allStockDataByDate(pickedDate)).spoiledStock;

  const modalContent = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Edit Prediction Data & Stok</h2>
      <form id="predictionForm">
        <div class="form-group">
          <label for="todayDate">Tanggal</label>
          <input type="text" id="todayDate" name="todayDate" value="${pickedDate}" disabled/>
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
            <option value="" ${eventRaya === "" ? "selected" : ""}>None</option>
            <option value="puasa" ${
              eventRaya === "puasa" ? "selected" : ""
            }>Puasa</option>
            <option value="Hari Raya Natal" ${
              eventRaya === "Hari Raya Natal" ? "selected" : ""
            }>Hari Raya Natal</option>
            <option value="Hari Raya Idul Adha" ${
              eventRaya === "Hari Raya Idul Adha" ? "selected" : ""
            }>Hari Raya Idul Adha</option>
            <option value="Hari Raya Idul Fitri" ${
              eventRaya === "Hari Raya Idul Fitri" ? "selected" : ""
            }>Hari Raya Idul Fitri</option>
            <option value="Tahun Baru Masehi" ${
              eventRaya === "Tahun Baru Masehi" ? "selected" : ""
            }>Tahun Baru Masehi</option>
            <option value="Tahun Baru Imlek" ${
              eventRaya === "Tahun Baru Imlek" ? "selected" : ""
            }>Tahun Baru Imlek</option>
          </select>
        </div>
        <div class="form-group">
          <label for="todaySpoiledStock">Roti rusak</label>
          <input type="number" id="todaySpoiledStock" name="todaySpoiled" min="0" value="${spoiledStock}" />
        </div>
        
        <button type="submit">Update</button>
      </form>
    </div>
  `;

  const modal = showModal(modalContent);

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

      const updatedData = {
        cuaca: updatedWeatherValue,
        event_raya: updatedEventRaya,
        manual_update: true,
      };

      // Add logic to handle the updated data here
      console.log("Updated Data:", {
        weatherValue: updatedWeatherValue,
        eventRaya: updatedEventRaya,
      });

      try {
        await isPredictionDataExist(pickedDate);
        await putPredictionData(updatedData, pickedDate);
        await putNewStockData(pickedDate, {
          spoiled_stock: updatedSpoiledStock,
        });
        await usePrediction();
        await displayerWeather();
        await displayerHolidays();
        await displayerPredictionData();
      } catch (error) {
        console.error("Error updating prediction data:", error);
      }

      // Close the modal after submission
      closeModal(modal);
    });
}
