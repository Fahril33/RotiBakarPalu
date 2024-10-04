import { createSalesTemplate } from "../template/template-creator";
import RBPsource from "../../../data/source";
import API_ENDPOINT from "../../../config/config";

import bagIcon from "../../../public/item/bag.png";
import soldIcon from "../../../public/item/money-bag.png";
import weatherIcon from '../../../public/item/cloudy.png'; // Import gambar cuaca
import tomorrowWeatherIcon from '../../../public/item/sun.png'; // Import gambar cuaca besok
import weekendIcon from '../../../public/item/weekend.png'; // Import gambar weekend
import eventIcon from '../../../public/item/ketupat.png'; // Import gambar event

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
    document.getElementById("imgPredict").src = bagIcon; // Set untuk icon bag
    document.querySelector('img[alt="soldIcon"]').src = soldIcon; // Set untuk icon sold
    document.querySelector('img[alt="weatherIcon"]').src = weatherIcon;
    document.querySelector('img[alt="tomorowWeatherIcon"]').src =tomorrowWeatherIcon;
    document.querySelector('img[alt="weekendIcon"]').src = weekendIcon;
    document.querySelector('img[alt="eventIcon"]').src = eventIcon;

    // AutoDate
    const dateElement = document.querySelector(".date");
    const exampleDate = new Date("2024-06-14");
    const options = { day: "numeric", month: "long", year: "numeric" };
    dateElement.textContent = `Penjualan ${exampleDate.toLocaleDateString(
      "id-ID",
      options
    )} | [Cuaca] | [AkhirPekan] | [event]`;

    // Ambil data penjualan dari backend
    const salesData = await RBPsource.salesData();

    // Debug log untuk memeriksa apakah salesData berupa array
    console.log("Sales data in afterRender:", salesData);

    // Tampilkan data dalam tabel
    this.populateSalesTable(salesData);

    const form = document.querySelector(".purchase-form form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Ambil nilai dari input form
      const harga = document.querySelector("#tipe").value;
      const jumlah = document.querySelector("#quantity").value;
      const lokasi = document.querySelector("#purchase-type-select").value;

      // Dapatkan waktu sekarang (date, time, day)
      const now = new Date();
      const date = now.toLocaleDateString("id-ID"); // Format tanggal seperti "dd/mm/yyyy"
      const time = now.toLocaleTimeString("id-ID"); // Format waktu seperti "hh:mm:ss"
      const day = now.toLocaleDateString("id-ID", { weekday: "long" }); // Mendapatkan nama hari (misalnya, "Senin")

      // Generate ID dari datetime, format: yymmddhhmm
      const generateID = () => {
        const year = String(now.getFullYear()).slice(2); // 2 digit terakhir dari tahun
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Bulan dalam format 2 digit
        const day = String(now.getDate()).padStart(2, "0"); // Tanggal dalam format 2 digit
        const hour = String(now.getHours()).padStart(2, "0"); // Jam dalam format 2 digit
        const minute = String(now.getMinutes()).padStart(2, "0"); // Menit dalam format 2 digit
        const second = String(now.getSeconds()).padStart(2, "0"); // Detik dalam format 2 digit
        return `${year}${month}${day}${hour}${minute}${second}`;
      };

      const id = generateID();

      // Membuat objek data untuk dikirim ke backend
      const saleData = {
        id: id,
        price: harga,
        quantity: jumlah,
        place: lokasi,
        date: date,
        time: time,
        day: day,
      };

      console.log(saleData); // Debug, cek apakah data sudah benar

      // Kirim data ke backend menggunakan POST
      try {
        const response = await fetch(`${API_ENDPOINT.SALES}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saleData),
        });

        if (!response.ok) {
          throw new Error("Gagal menyimpan data penjualan.");
        }

        const result = await response.json();
        console.log("Data penjualan berhasil disimpan:", result);

        // Update tampilan tabel dengan data terbaru setelah POST berhasil
        this.populateSalesTable([...salesData, result]);
      } catch (error) {
        console.error("Terjadi kesalahan saat menyimpan data:", error);
      }
    });
  },

  populateSalesTable(salesData) {
    const tbody = document.querySelector(".table-sales-today tbody");

    // Masukkan setiap item data penjualan ke dalam tabel (TANPA MENGOSONGKAN TABEL SETIAP KALI)
    salesData.forEach((sale) => {
      const existingRow = document.querySelector(`tr[data-id="${sale.id}"]`);

      // Cek apakah data sudah ada, jika belum, tambahkan
      if (!existingRow) {
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
      }
    });

    // Re-attach event listeners setiap kali tabel diupdate
    this.attachTableEventListeners();
  },

  attachTableEventListeners() {
    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        // const saleId = row.getAttribute("data-id"); // Ambil sale ID dari atribut data-id
        const saleMongoId = row.getAttribute("data-id"); // Pastikan ini adalah _id MongoDB
        const saleData = row.querySelectorAll("td");
        const date = saleData[0].textContent;
        const time = saleData[1].textContent;
        const price = saleData[2].textContent;
        const quantity = saleData[3].textContent;
        const place = saleData[4].textContent;

        // Buat modal popup
        const modal = document.createElement("div");
        modal.classList.add("modal");
        modal.innerHTML = `
          <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Update Data Penjualan</h2>
            <form>
            <div class="form-group">
              <label for="date">Tanggal</label>
              <input type="text" id="date" name="date" value="${date}" readonly>
            </div>
            <div class="form-group">
              <label for="time">Waktu</label>
              <input type="text" id="time" name="time" value="${time}" readonly>
            </div>
            <div class="form-group">
                <label for="price">Harga</label>
                <select id="price" name="price">
                  <option value="17000" ${
                    price === "17000" ? "selected" : ""
                  }>Satu Rasa</option>
                  <option value="20000" ${
                    price === "20000" ? "selected" : ""
                  }>Dua Rasa</option>
                  <option value="23000" ${
                    price === "23000" ? "selected" : ""
                  }>Mix 2 Rasa</option>
                </select>
              </div>
              <div class="form-group">
                <label for="quantity">Jumlah</label>
                <input type="number" id="quantity" name="quantity" value="${quantity}" min="1">
              </div>
              <div class="form-group">
                <label for="place">Lokasi</label>
                <select id="place" name="place">
                  <option value="outlet" ${
                    place === "outlet" ? "selected" : ""
                  }>Outlet</option>
                  <option value="merchant" ${
                    place === "merchant" ? "selected" : ""
                  }>Merchant</option>
                </select>
              </div>
              <button type="submit">Update</button>
            </form>
          </div>
        `;

        // Tambahkan modal ke dalam body
        document.body.appendChild(modal);

        // Tambahkan event listener untuk tombol close
        const closeButton = modal.querySelector(".close");
        closeButton.addEventListener("click", () => {
          modal.remove();
        });

        // Tambahkan event listener untuk mengklik di luar modal
        window.addEventListener("click", (event) => {
          if (event.target === modal) {
            modal.remove();
          }
        });

        // Tambahkan event listener untuk form submit
        const form = modal.querySelector("form");
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const updatedData = {
            // date: date,
            date: form.querySelector("#date").value,
            time: form.querySelector("#time").value,
            price: form.querySelector("#price").value,
            quantity: form.querySelector("#quantity").value,
            place: form.querySelector("#place").value,
          };

          try {
            // Gunakan saleMongoId untuk mengupdate data di MongoDB
            const response = await fetch(
              `${API_ENDPOINT.SALES}/${saleMongoId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
              }
            );

            if (!response.ok) {
              throw new Error(
                `Gagal mengupdate data penjualan dengan ID ${saleMongoId}.`
              );
            }

            const data = await response.json();
            console.log("Sale updated successfully:", data);
            // Update the row with new data
            row.innerHTML = `
              <td>${data.date}</td>
              <td>${data.time}</td>
              <td>${updatedData.price}</td>
              <td>${updatedData.quantity}</td>
              <td>${updatedData.place}</td>
              <td>
                <button class="edit-button">Edit</button>
                <button class="delete-button">Delete</button>
              </td>
            `;
            modal.remove();
            // Re-attach event listeners to the updated row
            this.attachTableEventListeners();
          } catch (error) {
            console.error("Error updating sale:", error);
          }
        });
      });
    });

    //
    //
    //

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        // const saleId = row.getAttribute("data-id"); // Ambil sale ID dari atribut data-id
        const saleMongoId = row.getAttribute("data-id"); // Pastikan ini adalah _id MongoDB

        // Add Sweet Alert confirmation
        const { default: swal } = await import("sweetalert2"); // Correct import
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
            const response = await fetch(
              `${API_ENDPOINT.SALES}/${saleMongoId}`,
              {
                method: "DELETE",
              }
            );
            if (!response.ok) {
              throw new Error(
                `Gagal menghapus data penjualan dengan ID ${saleMongoId}.`
              );
            }

            const data = await response.json();
            console.log("Sale deleted successfully:", data);
            row.remove(); // Hapus baris dari tabel setelah berhasil dihapus dari backend
          } catch (error) {
            console.error("Error deleting sale:", error);
          }
        }
      });
    });
  },
};

export default Sales;
