// src/utils/table-handler.js
import SalesSource from "../../data/salesSource";
import ModalHandler from "./modal-handler.js";

const TableHandler = {
  populateSalesTable(salesData) {
    const tbody = document.querySelector(".table-sales-today tbody");
    tbody.innerHTML = ''; // Hapus baris yang ada sebelum mengisi

    // Masukkan setiap item data penjualan ke dalam tabel
    salesData.forEach((sale) => {
      const row = `
      <tr data-id="${sale.id}">
        <td>${sale.date}</td>
        <td>${sale.time}</td>
        <td>${sale.price}</td>
        <td>${sale.quantity}</td>
        <td>${sale.place}</td>
        <td>
          <button class="edit-button">Edit</button>
          <button class="delete-button">Delete</button>
        </td>
      </tr>
    `;
      tbody.innerHTML += row;
    });

    // Pasang kembali event listener setelah tabel di-update
    this.attachTableEventListeners(salesData);
  },

  attachTableEventListeners(salesData) {
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const saleId = row.getAttribute("data-id");
        const saleData = salesData.find((sale) => sale.id == saleId);
        

        // Check if saleData is found
        if (saleData) {
          ModalHandler.showEditModal(saleData, row);
        } else {
          console.error("Sale data not found for ID:", saleId);
        }
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const saleId = row.getAttribute("data-id");

        // Konfirmasi penghapusan dengan Sweet Alert
        const { default: swal } = await import("sweetalert2");
        const confirmDelete = await swal.fire({
          title: "Konfirmasi Hapus",
          text: "Apakah Anda yakin ingin menghapus data penjualan ini?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Hapus",
          cancelButtonText: "Batal",
        });

        if (confirmDelete.isConfirmed) {
          try {
            await SalesSource.deleteSaleData(saleId);
            row.remove(); // Hapus baris dari tabel setelah berhasil dihapus dari backend
          } catch (error) {
            console.error("Error deleting sale:", error);
          }
        }
      });
    });
  },
};

export default TableHandler;
