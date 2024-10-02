import { createSalesTemplate } from "../template/template-creator";
import RBPsource from "../../../data/source";
import API_ENDPOINT from "../../../config/config";

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
          <td>${sale.date} - ${sale.time}</td>
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
        // Handle edit functionality
        const row = e.target.closest("tr");
        console.log("Edit data for:", row);
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const row = e.target.closest("tr");
        const saleId = row.getAttribute("data-id"); // Ambil sale ID dari atribut data-id

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
            const response = await fetch(`${API_ENDPOINT.SALES}/${saleId}`, {
              method: "DELETE",
            });
            if (!response.ok) {
              throw new Error(`Gagal menghapus data penjualan dengan ID ${saleId}.`);
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
