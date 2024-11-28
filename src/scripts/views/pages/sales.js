import {
  createSalesTemplate,
  createModalTemplate,
} from "../template/template-creator";
import RBPsource from "../../../data/source";
import API_ENDPOINT from "../../../config/config";
import {
  displayerHolidays,
  displayerIncome,
  displayerPredictionData,
  displayerSold,
  displayerWeather,
} from "../../utils/sales/displayerData";
import { handleFormSubmit } from "../../utils/sales/form-handler";
import { showModal, closeModal } from "../../utils/sales/modal-handler";
import { getCurrentDate } from "../../utils/datePicker";
import { bagIcon, soldIcon, editIcon } from "../../utils/icons";

import {
  isPredictionDataExist,
  syncSoldToPrediction,
} from "../../../data/utils/predictionHandler";

// import { usePrediction } from "../../utils/algorithm";
import { showPredictionModal } from "../../utils/sales/prediction-modal";
import { callDataShell, logDatesSince, showLoader } from "../../utils/syncData";
import { checkWeatherData } from "../../../data/utils/weatherHandler";
import { usePrediction } from "../../utils/algorithm";
import { allPredictionDataByDate } from "../../../data/allData";
// import { logDatesSince } from "../../utils/syncData";

const Sales = {
  async render() {
    return `
      <div class="content">
        <div id="sales-content">
          ${createSalesTemplate()}
        </div>
      </div>
    `;
  },

  async afterRender() {
    showLoader(true, "Memuat data penjualan...");
    // image render
    document.getElementById("imgPredict").src = bagIcon;
    document.querySelector('img[alt="soldIcon"]').src = soldIcon;
    document.querySelector('img[alt="editIcon"]').src = editIcon;

    this.initializeDatePicker();

    // Tampilkan loader sebelum memuat data

    try {
      await this.displaySalesData();
    } catch (error) {
      console.error("Error loading sales data:", error);
    } finally {
      // Sembunyikan loader setelah semua data dimuat
      showLoader(false);
    }

    // FormHandler-Input
    const form = document.querySelector(".purchase-form form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleFormSubmit(API_ENDPOINT, this);
      await this.displaySalesData();
    });

    document
      .getElementById("editPrediction")
      .addEventListener("click", async () => {
        await showPredictionModal();
      });

    // const currentDate = getCurrentDate().pickedDate;
    // await isPredictionDataExist(currentDate)
    // console.log('curddate', currentDate);
    // const todaydata = (await allPredictionDataByDate("2024-11-22")).filteredData
    // console.log('todayData', todaydata);

    await callDataShell();
  },

  initializeDatePicker() {
    const currentDate = getCurrentDate();
    this.setDatePickerValue(currentDate.pickedDate);

    document
      .getElementById("incrementDate")
      .addEventListener("click", () => this.changeDate(1));
    document
      .getElementById("decrementDate")
      .addEventListener("click", () => this.changeDate(-1));
    document
      .getElementById("dataDatePicker")
      .addEventListener("input", (event) => {
        const newDate = event.target.value;
        console.log(`Manual date change: ${newDate}`);
        this.filterDataByDate(newDate);
      });
  },

  setDatePickerValue(date) {
    document.getElementById("dataDatePicker").value = date;
    this.filterDataByDate(date);
  },

  changeDate(days) {
    const datePicker = document.getElementById("dataDatePicker");
    let selectedDate = new Date(datePicker.value);

    if (isNaN(selectedDate)) {
      selectedDate = new Date();
    }

    selectedDate.setDate(selectedDate.getDate() + days);
    this.setDatePickerValue(selectedDate.toISOString().split("T")[0]);
  },

  async filterDataByDate(selectedDate) {
    try {
      const sales = await RBPsource.salesData();
      const filteredData = sales.find((entry) => entry.date === selectedDate);
      // console.log(`Data for date ${selectedDate}:`, filteredData);
      this.populateSalesTable(filteredData);

      // await logDatesSince();
      await displayerSold();
      await displayerIncome();
      await displayerWeather();
      await displayerHolidays();
      await displayerPredictionData();
    } catch (error) {
      console.error("Error filtering data:", error);
    }
  },
  // buat hndler displayer data
  async displaySalesData() {
    await checkWeatherData();
    await displayerSold();
    await displayerIncome();
    await displayerWeather();
    await displayerPredictionData();

    await this.filterDataByDate(
      document.getElementById("dataDatePicker").value
    );
  },

  populateSalesTable(salesData) {
    const tbody = document.querySelector(".table-sales-today tbody");
    tbody.innerHTML = "";

    if (salesData && salesData.sold && salesData.sold.length > 0) {
      salesData.sold.forEach((soldItem) => {
        const row = `
          <tr data-id="${soldItem._id}">
            <td>${soldItem.time}</td>
            <td>${soldItem.price}</td>
            <td>${soldItem.quantity}</td>
            <td>${soldItem.place}</td>
            <td>
              <div class="actions">
                  <div class="button edit">
                      <i class="fas fa-edit"></i>
                      <span>Edit</span>
                  </div>
                  <div class="button delete">
                      <i class="fas fa-trash-alt"></i>
                      <span>Delete</span>
                  </div>
              </div>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    } else {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center;">No sales data available for this date.</td>
        </tr>
      `;
    }

    this.attachEditListeners();
    this.attachDeleteListeners();
  },

  attachEditListeners() {
    const editButtons = document.querySelectorAll(".button.edit");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleEdit(e));
    });
  },

  attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll(".button.delete");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.handleDelete(e));
    });
  },

  async handleEdit(e) {
    const existingModal = document.querySelector(".modal");
    if (existingModal) {
      existingModal.remove();
    }

    const row = e.target.closest("tr");
    const saleMongoId = row.getAttribute("data-id");
    const saleData = row.querySelectorAll("td");
    const date = document.getElementById("dataDatePicker").value;
    const time = saleData[0].textContent;
    const price = saleData[1].textContent;
    const quantity = saleData[2].textContent;
    const place = saleData[3].textContent;

    const modalContent = createModalTemplate({
      date,
      time,
      price,
      quantity,
      place,
    });
    const modal = showModal(modalContent);

    modal.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const newPrice = modal.querySelector("#price").value;
      const newQuantity = modal.querySelector("#quantity").value;
      const newPlace = modal.querySelector("#place").value;

      const updatedSale = {
        time: time,
        price: newPrice,
        quantity: newQuantity,
        income: newPrice * newQuantity,
        place: newPlace,
      };

      try {
        const response = await fetch(
          `${API_ENDPOINT.SALES}/date/${date}/${saleMongoId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedSale),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to update sale data with ID ${saleMongoId}.`);
        }

        const result = await response.json();
        console.log("Sale data successfully updated:", result);

        
        closeModal(modal);
        await logDatesSince(date);
        await this.displaySalesData();

        //
        // Sesuaikan Nilai Terjual di Prediciton
        //
        await syncSoldToPrediction(date);
      } catch (error) {
        console.error("An error occurred while updating data:", error);
      }
    });
  },

  async handleDelete(e) {
    const row = e.target.closest("tr");
    const saleMongoId = row.getAttribute("data-id");
    const date = document.getElementById("dataDatePicker").value;

    const { default: swal } = await import("sweetalert2");
    const confirmDelete = await swal.fire({
      title: "Confirm Delete",
      text: "Are you sure you want to delete this sale data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });
    if (confirmDelete.isConfirmed) {
      try {
        const response = await fetch(
          `${API_ENDPOINT.SALES}/date/${date}/item/${saleMongoId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete sale data with ID ${saleMongoId}.`);
        }

        const result = await response.json();
        console.log("Sale data successfully deleted:", result);

        await logDatesSince(date);

        await this.displaySalesData();

        //
        // Sesuaikan Nilai Terjual di Prediciton
        //
        await syncSoldToPrediction(date);
      } catch (error) {
        console.error("An error occurred while deleting data:", error);
      }
    }
  },
};

export default Sales;
