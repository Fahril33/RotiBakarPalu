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
  hideComponents,
} from "../../utils/sales/displayerData";
import { handleFormSubmit } from "../../utils/sales/form-handler";
import { showModal, closeModal } from "../../utils/sales/modal-handler";
import { datePickerValue, getCurrentDate } from "../../utils/datePicker";
import { bagIcon, soldIcon, editIcon } from "../../utils/icons";

// import { usePrediction } from "../../utils/algorithm";
import { showPredictionModal } from "../../utils/sales/prediction-modal";
import { callDataShell, logDatesSince } from "../../utils/syncData";
import { checkUserRole } from "../../utils/interceptor";
import Swal from "sweetalert2";
import { allPredictionDataByDate } from "../../../data/allData";

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
    // image render
    document.getElementById("imgPredict").src = bagIcon;
    document.querySelector('img[alt="soldIcon"]').src = soldIcon;
    document.querySelector('img[alt="editIcon"]').src = editIcon;

    this.initializeDatePicker();

    await this.displaySalesData();

    // FormHandler-Input
    const form = document.querySelector(".purchase-form form");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("ini diklik");
      const isAllow = await checkUserRole();
      console.log("sialow", !isAllow);

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
      oneDaysAhead.setDate(currDate.getDate());

      if (pickedDateObj < oneDaysAgo) {
        if (!isAllow) {
          Swal.fire({
            icon: "error",
            title: "Akses Terbatas!",
            text: "Operasional hari ini telah dibatasi.",
            confirmButtonColor: "#3085d6",
          });
          return;
        }
      } else if (pickedDateObj > oneDaysAhead) {
        if (!isAllow) {
          Swal.fire({
            icon: "info",
            title: "Akses Terbatas!",
            text: "Operasional hari ini belum dimulai.",
            confirmButtonColor: "#3085d6",
          });
          return;
        }
      }
      await handleFormSubmit(API_ENDPOINT, this);
      await this.displaySalesData();
      await logDatesSince(pickedDate);
    });

    document
      .getElementById("editPrediction")
      .addEventListener("click", async () => {
        await showPredictionModal();
      });

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

      await displayerSold();
      await displayerIncome();
      await displayerWeather();
      await displayerHolidays();
      await displayerPredictionData();

      if (!(await checkUserRole())) {
        await hideComponents(selectedDate);
      }
    } catch (error) {
      console.error("Error filtering data:", error);
    }
    // await callDataShell();
  },
  // buat hndler displayer data
  async displaySalesData() {
    const datePickerElement = document.getElementById("dataDatePicker");
    if (datePickerElement) {
      await this.filterDataByDate(datePickerElement.value);
    }

    await displayerSold();
    await displayerIncome();
  },

  populateSalesTable(salesData) {
    const tbody = document.querySelector(".table-sales-today tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (salesData && salesData.sold && salesData.sold.length > 0) {
      salesData.sold.forEach((soldItem) => {
        const row = `
          <tr data-id="${soldItem._id}">
            <td>${soldItem.time}</td>
            <td>${soldItem.price}</td>
            <td>${soldItem.quantity}</td>
            <td>${soldItem.place}</td>
            <td id="salesActionBtn">
              <div class="actions">
                  <div class="button edit">
                      <i class="fas fa-edit" id="salesEditBtn"></i>
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
          <td colspan="5" style="text-align: center;"><span class="noData">Tidak ada data untuk hari ini.</span></td>
        </tr>
      `;
    }

    // Cek Operasional
    (async () => {
      const thisDayDate = (await datePickerValue()).dateValue;
      const thisDayOperational = (await allPredictionDataByDate(thisDayDate))
        .operasional;

      const datePickerElement = document.getElementById("dataDatePicker");
      if (datePickerElement) {
        if (thisDayOperational === true) {
          datePickerElement.style.backgroundColor = "#00ff5e63";
        } else if (thisDayOperational === false) {
          datePickerElement.style.backgroundColor = "#ff00001a";
        } else {
          datePickerElement.style.backgroundColor = "white";
        }
      }
    })();

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

    // checking
    const isAllow = await checkUserRole();
    console.log("sialow", !isAllow);

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
    oneDaysAhead.setDate(currDate.getDate());

    if (pickedDateObj < oneDaysAgo) {
      if (!isAllow) {
        Swal.fire({
          icon: "error",
          title: "Akses Terbatas!",
          text: "Operasional hari ini telah dibatasi.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    } else if (pickedDateObj > oneDaysAhead) {
      if (!isAllow) {
        Swal.fire({
          icon: "info",
          title: "Akses Terbatas!",
          text: "Operasional hari ini belum dimulai.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    // Continue

    const row = e.target.closest("tr");
    if (!row) return;
    const saleMongoId = row.getAttribute("data-id");
    if (!saleMongoId) return;
    const saleData = row.querySelectorAll("td");
    if (!saleData) return;
    const dateInput = document.getElementById("dataDatePicker");
    if (!dateInput) return;
    const date = dateInput.value;
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
        closeModal(modal);
        Toast.fire({
          icon: "success",
          title: "Pesanan berhasil diperbarui.",
        });
        await this.displaySalesData();
        await logDatesSince(date);

        //
        // Sesuaikan Nilai Terjual di Prediciton
        //
      } catch (error) {
        console.error("An error occurred while updating data:", error);
      }
    });
  },

  async handleDelete(e) {
    // Checking
    const isAllow = await checkUserRole();
    console.log("sialow", !isAllow);

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
    oneDaysAhead.setDate(currDate.getDate());

    if (pickedDateObj < oneDaysAgo) {
      if (!isAllow) {
        Swal.fire({
          icon: "error",
          title: "Akses Terbatas!",
          text: "Operasional hari ini telah dibatasi.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    } else if (pickedDateObj > oneDaysAhead) {
      if (!isAllow) {
        Swal.fire({
          icon: "info",
          title: "Akses Terbatas!",
          text: "Operasional hari ini belum dimulai.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    // Continue
    const row = e.target.closest("tr");
    const saleMongoId = row.getAttribute("data-id");
    const date = document.getElementById("dataDatePicker").value;

    const { default: swal } = await import("sweetalert2");
    const confirmDelete = await swal.fire({
      title: "Konfirmasi Hapus",
      text: "Anda yakin pesanan ini harus dihapus?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
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

        // const result = await response.json();
        // console.log("Sale data successfully deleted:", result);

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
        await this.displaySalesData();
        Toast.fire({
          icon: "success",
          title: "Pesanan berhasil dihapus.",
        });

        await logDatesSince(date);
      } catch (error) {
        console.error("An error occurred while deleting data:", error);
      }
    }
  },
};

export default Sales;
