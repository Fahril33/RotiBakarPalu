import generateID from "./generateID";
import RBPsource from "../../../data/source";
import {
  datePickerValue,
  getCurrentDate,
} from "../datePicker";
import {
  stockConverter,
} from "../../../data/utils/stockHandler";
import {
  allPredictionDataByDate,
  allSalesDataByDate,
} from "../../../data/allData";
import {
  isPredictionDataExist,
  putPredictionData,
} from "../../../data/utils/predictionHandler";
import { hariDariTanggal, logDatesSince, syncSalesToOthers } from "../syncData";
import Swal from "sweetalert2";
export const handleFormSubmit = async (API_ENDPOINT, salesInstance) => {
  // Disable Add Sales Button
  const salesBtn = document.getElementById("addSales");
  salesBtn.disabled = true;

  // Ambil nilai dari input form
  const harga = document.querySelector("#tipe").value;
  const jumlah = document.querySelector("#quantity").value;
  const lokasi = document.querySelector("#purchase-type-select").value;

  // Dapatkan waktu sekarang
  const now = new Date();
  // const date = now.toLocaleDateString("id-ID");
  const formattedDate = (await datePickerValue()).dateValue;
  // const formattedDate = "10-19-2024"
  const time = now.toLocaleTimeString("id-ID");
  const formattedTime = time.split(".").join(":");
  const day = (await hariDariTanggal(formattedDate)).hari;

  // Generate ID dari datetime
  const id = generateID();
  const income = parseInt(harga) * parseInt(jumlah);

  // Membuat objek data untuk dikirim ke backend
  // const saleData = {
  //   id: id,
  //   price: harga,
  //   quantity: jumlah,
  //   place: lokasi,
  //   date: date,
  //   time: time,
  //   day: day,
  // };
  let totalMerchantIncome = 0;
  let totalOutletIncome = 0;

  if (lokasi === "outlet") {
    totalOutletIncome = income;
  } else if (lokasi === "merchant") {
    totalMerchantIncome = income;
  }

  const salesData = {
    id: id, // Ganti dengan ID yang sesuai
    date: formattedDate, // Tanggal penjualan
    day: day, // Hari penjualan
    sold: [
      {
        time: formattedTime, // Waktu penjualan
        price: harga, // Harga per item
        quantity: jumlah, // Jumlah yang terjual
        income: income, // Pendapatan dari penjualan
        place: lokasi, // Tempat penjualan
      },
    ],
    totalQuantity: jumlah, // Total jumlah yang terjual
    totalIncome: income, // Total pendapatan
    totalMerchantIncome: totalMerchantIncome,
    totalOutletIncome: totalOutletIncome,
  };
  // console.log("Data penjualan:", salesData);

  // Periksa apakah sudah ada data dengan tanggal hari ini atau belum
  const allSalesData = await RBPsource.salesData();
  const existingData = allSalesData.filter(
    (sale) => sale.date === formattedDate
  );
  if (existingData.length > 0) {
    // console.log("Data untuk hari ini sudah ada:", existingData);

    // Lakukan put
    // const existingSale = existingData[0]; // Ambil data penjualan yang ada
    const updatedSoldItem = {
      time: formattedTime, // Waktu penjualan
      price: harga, // Harga per item
      quantity: jumlah, // Jumlah yang terjual
      income: income, // Pendapatan dari penjualan
      place: lokasi, // Tempat penjualan
    };

    try {
      await fetch(`${API_ENDPOINT.SALES}/date/${formattedDate}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json", // Menentukan tipe konten
        },
        body: JSON.stringify(updatedSoldItem), // Mengubah data menjadi string JSON
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Mengubah respons menjadi JSON
        })
        .then(() => {
          // console.log("Data berhasil diperbarui:", data); // Menampilkan data yang diperbarui
          const Toast = Swal.mixin({
            toast: true,
            position: "top-start",
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
            title: "Pesanan berhasil dicatat.",
          });
        })
        .catch((error) => {
          console.error("Terjadi kesalahan:", error); // Menangani kesalahan
        });

      // Ambil data terbaru dari server setelah berhasil memperbarui
      const updatedSalesData = await RBPsource.salesData();

      // Perbarui tampilan tabel dengan data terbaru
      salesInstance.populateSalesTable(updatedSalesData);
      await syncSalesToOthers(formattedDate);

      //
      // Sesuaikan Nilai Terjual di Prediciton
      //

      await logDatesSince(formattedDate);
    } catch (error) {
      console.error("Terjadi kesalahan saat memperbarui data:", error);
    }
  } else {
    try {
      await fetch(API_ENDPOINT.SALES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Menentukan tipe konten
        },
        body: JSON.stringify(salesData), // Mengubah data menjadi string JSON
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Mengubah respons menjadi JSON
        })
        .then(async () => {
          // console.log("Data berhasil disimpan:", data); // Menampilkan data yang disimpan
          const Toast = Swal.mixin({
            toast: true,
            position: "top-start",
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
            title: "Pesanan berhasil dicatat.",
          });
        })
        .catch((error) => {
          console.error("Terjadi kesalahan:", error); // Menangani kesalahan
        });

      // Ambil data terbaru dari server setelah berhasil menyimpan
      const updatedSalesData = await RBPsource.salesData();
      await logDatesSince(formattedDate);
      // Perbarui tampilan tabel dengan data terbaru
      salesInstance.populateSalesTable(updatedSalesData);
      await syncSalesToOthers(formattedDate);

      const soldConvertedValue = await stockConverter(jumlah);
      const predicitionData = {
        terjual: soldConvertedValue,
        operasional: true,
      };

      const isPredictionShellAvailable = (
        await allPredictionDataByDate(formattedDate)
      ).filteredData;
      if (isPredictionShellAvailable === `none`) {
        await isPredictionDataExist(formattedDate);
        console.log("shell predicition dibuat dibuat, lanjut put");
        await putPredictionData(predicitionData, formattedDate);
      } else {
        console.log("shell prediction sudah ada, skip ke put");
        await putPredictionData(predicitionData, formattedDate);
      }
    } catch (error) {
      console.error("Terjadi kesalahan saat menyimpan data:", error);
    }
  }

  // enable sales button after upload data
  salesBtn.disabled = false;

  //
  // STATUS Outlet
  const todayDate = getCurrentDate().pickedDate;
  let isOpen = (await allPredictionDataByDate(todayDate)).operasional;
  const todaySold = (await allSalesDataByDate(getCurrentDate().pickedDate))
    .soldTotal;
  const checkbox = document.querySelector("#button-3 .checkbox");

  if (!isOpen && todaySold > 0) {
    checkbox.checked = true;
    await putPredictionData({ operasional: true }, todayDate);
  }
};

