// import RBPsource from "../../data/source";

import Swal from "sweetalert2";
import { getCurrentDate } from "../datePicker";
import { logDatesSince } from "../syncData";

export const showModal = (content) => {
  const existingModal = document.querySelector(".modal");
  if (existingModal) {
    console.log('modal double jir', );
    existingModal.remove();
  }
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = content;
  document.body.appendChild(modal);

  // Tutup modal saat tombol 'X' ditekan
  modal
    .querySelector(".close")
    .addEventListener("click", () => closeModal(modal));

  // Tutup modal ketika area di luar modal diklik
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  return modal;
};

export const closeModal = (modal) => {
  if (modal) {
    document.body.removeChild(modal);
  }
};

export function handleModalSubmit (
  modal,
  saleMongoId,
  date,
  time,
  API_ENDPOINT
  ) {
  modal.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Ambil nilai baru dari form
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
      // Mengirim permintaan PUT ke endpoint yang ditentukan
      const response = await fetch(
        `${API_ENDPOINT.SALES}/date/${date}/${saleMongoId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedSale),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Gagal memperbarui data penjualan dengan ID ${saleMongoId}.`
        );
      }

      // const result = await response.json();
      // console.log("Data penjualan berhasil diperbarui:", result);
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
        title: "Catatan berhasil diperbarui.",
      });
      const currDate = getCurrentDate().pickedDate
      await logDatesSince(currDate);


      // Perbarui tampilan tabel
      const row = document.querySelector(`tr[data-id="${saleMongoId}"]`);
      row.querySelectorAll("td")[2].textContent = newPrice;
      row.querySelectorAll("td")[3].textContent = newQuantity;
      row.querySelectorAll("td")[4].textContent = newPlace;

      // Tutup modal
      closeModal(modal);
    } catch (error) {
      console.error("Terjadi kesalahan saat memperbarui data:", error);
    }
  });
}
