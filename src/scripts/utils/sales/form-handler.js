import generateID from "./generateID";
import RBPsource from "../../../data/source";
import {
  datePickerValue,
  getCurrentDate,
  minusOneDayDate,
} from "../datePicker";
import {
  postStockData,
  putNewStockData,
  stockConverter,
} from "../../../data/utils/stockHandler";
import {
  allFinanceDataByDate,
  allPredictionDataByDate,
  allSalesDataByDate,
  allShoplistDataByDate,
  allStockDataByDate,
} from "../../../data/allData";
import {
  isPredictionDataExist,
  putPredictionData,
} from "../../../data/utils/predictionHandler";
import { logDatesSince } from "../syncData";
import Swal from "sweetalert2";
import {
  postFinance,
  putFinanceData,
} from "../../../data/utils/financeHandler";

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
  const day = now.toLocaleDateString("id-ID", { weekday: "long" });

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

      // await logDatesSince(formattedDate);
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
      // await logDatesSince(formattedDate);
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

export async function syncSalesToOthers(date) {
  const yesterdayDate = (await minusOneDayDate()).resultDate;

  //
  // Sales to Stock Sync
  //
  let newStocksShellData;

  // StockShell
  const stockShellToday = (await allStockDataByDate(date)).isThere;
  const stockShellYesterday = (await allStockDataByDate(yesterdayDate)).isThere;

  if (!stockShellYesterday) {
    console.log(
      "Shell Stock hari sebelumnya tidak ada, deklarasi callDataShell()"
    );
  }

  // Stocks Data
  const initialStock = await (
    await allStockDataByDate(yesterdayDate)
  ).remainingStock;
  const additionalStock = (await allShoplistDataByDate(date)).rotiQuantity;
  //
  const spoiledStock = stockShellToday
    ? (await allStockDataByDate(date)).spoiledStock
    : 0;
  //
  const soldStock = await (await allSalesDataByDate(date)).soldTotal;
  const totalStock = initialStock + additionalStock;
  //
  //
  newStocksShellData = {
    ...(stockShellToday ? {} : { date: date }),
    initial_stock: initialStock,
    additional_stock: additionalStock,
    spoiled_stock: spoiledStock,
    sold_stock: soldStock,
    total_stock: totalStock,
    remaining_stock: totalStock - soldStock - spoiledStock,
  };

  if (!stockShellToday) {
    await postStockData(newStocksShellData);
    //
  } else {
    await putNewStockData(date, newStocksShellData);
    //
  }

  //
  // Sales to finance
  //
  let newFinanceShellData;

  // Finance shell
  const financeShellToday = (await allFinanceDataByDate(date)).isThere;
  const financeShellYesterday = (await allFinanceDataByDate(yesterdayDate))
    .isThere;

  if (!financeShellYesterday) {
    console.log("shell finance kemarin tidak ada, deklarasikan callShell()");
  }

  // Finance data
  const inCash = (await allSalesDataByDate(date)).totalOutletIncome;
  const inDebit = (await allSalesDataByDate(date)).totalMerchantIncome;
  const outCash = (await allShoplistDataByDate(date)).totalShopCash;
  const outDebit = (await allShoplistDataByDate(date)).totalShopDebit;
  //
  const yesterdayCash = (await allFinanceDataByDate(yesterdayDate)).totalCash;
  const yesterdayDebit = (await allFinanceDataByDate(yesterdayDate)).totalDebit;

  newFinanceShellData = {
    ...(financeShellToday ? {} : { date: date }),
    in_cash: inCash,
    in_debit: inDebit,
    out_cash: outCash,
    out_debit: outDebit,
    total_cash: yesterdayCash + inCash - outCash,
    total_debit: yesterdayDebit + inDebit - outDebit,
  };

  if (!financeShellToday) {
    await postFinance(newFinanceShellData);
    //
  } else {
    await putFinanceData(newFinanceShellData, date);
    //
  }
}
