// import { minusOneDayStockData } from "../../data/allData";
import Swal from "sweetalert2";
import {
  allFinanceDataByDate,
  allPredictionDataByDate,
  allSalesDataByDate,
  allShoplistDataByDate,
  allStockDataByDate,
} from "../../data/allData";
import {
  createNewFinanceDataShell,
  postFinance,
  putFinanceData,
} from "../../data/utils/financeHandler";
import { getHolidayValue } from "../../data/utils/holidayHandler";
import { syncSoldToPrediction } from "../../data/utils/predictionHandler";
import {
  isAnyStockDataShell,
  postStockData,
  putNewStockData,
} from "../../data/utils/stockHandler";
import { checkWeatherData } from "../../data/utils/weatherHandler";
import {
  getCurrentDate,
  getTomorrowDate,
  getYesterdayDate,
  minusOneDayDate,
} from "./datePicker";
import { closeModal, showModal } from "./sales/modal-handler";
import { usePrediction } from "./algorithm";
import { updateShoppingListData } from "../../data/utils/shoppingHandler";

// Tambahkan fungsi ini di luar logDatesSince
async function subtractOneDay(dateString) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function logDatesSince(pickedDate, logsince = false) {
  // let dateValue = (await datePickerValue()).dateValue;
  let dateValue = pickedDate;
  console.log("dateValue", dateValue);

  const [year, month, day] = dateValue.split("-").map(Number);
  const startDate = new Date(year, month - 1, day); // Bulan dimulai dari 0
  const today = new Date();

  // Mengecek apakah startDate kurang dari hari ini
  if (startDate < today) {
    let currentDate = new Date(startDate);

    // Melakukan looping dari startDate hingga hari ini
    while (currentDate <= today) {
      // Log tanggal saat ini dalam format YYYY-MM-DD
      const formattedDate = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

      // Menampilkan loader
      if (logsince) {
        let syncText = `Sinkronisasi data: ${formattedDate}`;
        showLoader(true, syncText);
      }

      const formattedDateMinusOne = await subtractOneDay(formattedDate);

      //
      // Sync Stock
      //
      let initialStock = (await allStockDataByDate(formattedDateMinusOne))
        .remainingStock;
      let additionalStock = (await allShoplistDataByDate(formattedDate))
        .rotiQuantity;
      let spoiledStock = (await allStockDataByDate(formattedDate)).spoiledStock;
      let soldStock = (await allSalesDataByDate(formattedDate)).soldTotal;
      let totalStock = initialStock + additionalStock;
      let remainingStock = totalStock - soldStock - spoiledStock;

      let stockData = {
        initial_stock: initialStock,
        additional_stock: additionalStock,
        spoiled_stock: spoiledStock,
        sold_stock: soldStock,
        total_stock: totalStock,
        remaining_stock: remainingStock,
      };

      let isStockShellAvailable = (await allStockDataByDate(formattedDate))
        .filteredData;
      // console.log("isstockada", isStockShellAvailable);
      if (isStockShellAvailable === `none`) {
        // console.log("gaada bang, wait ditambahin");
        await isAnyStockDataShell(formattedDate);
        // console.log("oke udah ditambahin, lanjut sinkron data stock");
        await putNewStockData(formattedDate, stockData);
        // console.log(
        //   "Data stok untuk",
        //   formattedDate,
        //   "sinkron dengan",
        //   formattedDateMinusOne
        // );
      } else {
        await putNewStockData(formattedDate, stockData);
        // console.log("ada, ini bang", isStockShellAvailable);
      }

      //
      // Sync Stock To Prediction
      //
      await syncSoldToPrediction(formattedDate);

      //
      // Sync Shoplist totals
      //
      const shoppingData = (await allShoplistDataByDate(formattedDate)).todayShoplist;
      const shoppingDataId = shoppingData._id

      const procesedData = await hitungTotalCashDebit(shoppingData);
      let totalShoppingCash;
      let totalShoppingDebit;
      if (procesedData && (procesedData.totalCash || procesedData.totalDebit)) {
        totalShoppingCash = procesedData.totalCash;
        totalShoppingDebit = procesedData.totalDebit

        const newData = {
          totalCash: totalShoppingCash,
          totalDebit: totalShoppingDebit,
          totalBelanja: totalShoppingCash+totalShoppingDebit
        }
        // console.log('shopdataid', shoppingDataId);
        // console.log('newData', newData);
        await updateShoppingListData(shoppingDataId, newData);
      } else {
        // console.log("No data available for the selected date.");
      }

      //
      // fix days on sales
      //
      // const salesDay = (await hariDariTanggal(formattedDate)).hari;
      // await PutSalesData(formattedDate, { day: salesDay });

      //
      // Sync Finance
      //

      let inCash = (await allSalesDataByDate(formattedDate)).totalOutletIncome;
      let inDebit = (await allSalesDataByDate(formattedDate))
        .totalMerchantIncome;
      let outCash = (await allShoplistDataByDate(formattedDate)).totalShopCash;
      let outDebit = (await allShoplistDataByDate(formattedDate))
        .totalShopDebit;
      let ydayTotalCash = (await allFinanceDataByDate(formattedDateMinusOne))
        .totalCash;
      let ydayTotalDebit = (await allFinanceDataByDate(formattedDateMinusOne))
        .totalDebit;
      let cashToDebit = (await allFinanceDataByDate(formattedDate)).cashToDebit;
      let debitToCash = (await allFinanceDataByDate(formattedDate)).debitToCash;

      let financeData = {
        in_cash: inCash,
        in_debit: inDebit,
        out_cash: outCash,
        out_debit: outDebit,
        total_cash:
          ydayTotalCash + inCash - outCash + debitToCash - cashToDebit,
        total_debit:
          ydayTotalDebit + inDebit - outDebit + cashToDebit - debitToCash,
      };

      // console.log("calon data", financeData);

      let isFinanceShellAvailable = (await allFinanceDataByDate(formattedDate))
        .filteredData;
      if (isFinanceShellAvailable === `none`) {
        // console.log("gaada shell bang, wait ditambahin dulu");
        await createNewFinanceDataShell(formattedDate);
        // console.log("oke udah ditambahin, lanjut sinkron data finance");
        await putFinanceData(financeData, formattedDate);
        // console.log(
        //   "Data finance untuk",
        //   formattedDate,
        //   "sinkron dengan",
        //   formattedDateMinusOne
        // );
      } else {
        // console.log(
        //   "shell ada nih bang:",
        //   isFinanceShellAvailable,
        //   "skip ke sinkron data"
        // );
        await putFinanceData(financeData, formattedDate);
        // console.log(
        //   "Data finance untuk",
        //   formattedDate,
        //   "sinkron dengan",
        //   formattedDateMinusOne
        // );
      }

      // Tambahkan jeda sebelum melanjutkan ke tanggal berikutnya
      await new Promise((resolve) => setTimeout(resolve, 0)); // jeda 1 detik
      // console.log(`Processing date: ${formattedDate}`);

      // Sembunyikan loader setelah selesai
      showLoader(false);
      // Tambahkan satu hari
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else {
    // console.log("The dateValue is not less than today's date.");
  }
}

export function showLoader(isLoading, text) {
  const loader = document.querySelector(".custom-loader");
  const overlay = document.querySelector(".overlay");
  const loaderText = document.querySelector(".loader-text");

  if (isLoading) {
    overlay.style.display = "block"; // Tampilkan overlay
    loader.style.display = "flex"; // Tampilkan loader
    loaderText.textContent = `${text}`; // Tampilkan tanggal yang sedang diproses
  } else {
    overlay.style.display = "none"; // Sembunyikan overlay
    loader.style.display = "none"; // Sembunyikan loader
  }
}

//
// Pemanggilan shell data hari ini dan besok termasuk data prediksi untuk hari ini
//
export async function callDataShell() {
  const currDate = getCurrentDate().pickedDate;
  const tomorrowDate = getTomorrowDate().tomorrowDate;
  //
  const financeData = (await allFinanceDataByDate(currDate)).filteredData;
  const stockData = (await allStockDataByDate(currDate)).filteredData;
  //
  const predicitionDataToday = (await allPredictionDataByDate(currDate))
    .filteredData;
  const predictionDataTomorrow = await (
    await allFinanceDataByDate(tomorrowDate)
  ).filteredData;

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: false,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  // =? DATA HARI INI ADA?
  if (financeData === `none` || stockData === `none`) {
    // console.log("Data tidak tersedia");

    // Tampilkan toast loading
    const loadingToast = Toast.fire({
      html: `
        <div class="loader" style="display: block"></div>
        <span style="margin-left: 10px;">Memuat data, harap tunggu...</span>
    `,
    });

    // =? DATA PREDIKSI ADA?
    if (!predicitionDataToday || !predictionDataTomorrow) {
      try {
        await Promise.all([checkWeatherData(), getHolidayValue()]);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: `Ooops..`,
          text: "Gagal mengambil data cuaca atau Event/Libur!. Silahkan Refresh Halaman",
        });
        loadingToast.close();
        return;
      }
    } else {
      console.log("Data Prediksi sudah ada");
    }

    // Caritau kapan terakhir buka
    const yesterdayDate = getYesterdayDate().yesterday;
    const operationalYesterday = (await allPredictionDataByDate(yesterdayDate))
      .operasional;

    if (operationalYesterday) {
      await logDatesSince(currDate);
    } else {
      let operationalDate = null;
      let currentDate = new Date(currDate);
      while (!operationalDate) {
        currentDate.setDate(currentDate.getDate() - 1);
        const formattedDate = `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
        const operationalData = (await allPredictionDataByDate(formattedDate))
          .filteredData;
        if (operationalData && operationalData.operasional) {
          operationalDate = formattedDate;
        }
      }
      // return operationalDate;
      // console.log("terakhir buka pada tanggal", operationalDate);
      await logDatesSince(operationalDate);
    }

    //

    loadingToast.close();
  } else {
    // console.log("Semua Data Tersedia");
    // Cuaca besok ada?
    const realtomorrowWeather = (
      await allPredictionDataByDate(getCurrentDate().pickedDate)
    ).cuacaBesok;
    if (
      realtomorrowWeather === "none" ||
      realtomorrowWeather === "" ||
      realtomorrowWeather === "unknown"
    ) {
      await checkWeatherData();
    }

    // prediction besok ada?
    const realtomorrowPrediction = (await allPredictionDataByDate(tomorrowDate))
      .hasilPrediksi;
    // console.log("rtp", realtomorrowPrediction);
    if (
      realtomorrowPrediction === "" ||
      realtomorrowPrediction === "none" ||
      realtomorrowPrediction === "unknown"
    ) {
      // console.log("kosong cuy");
      await usePrediction();
    }
  }

  // const predictionData = await allPredictionDataByDate(currDate)
  // console.log("currDate", currDate);
  // await logDatesSince(currDate)
  // await checkWeatherData();
  // await getHolidayValue();
  // await usePrediction();
}

export function manualSyncData() {
  const modalContent = `
    <div class="modal-content" id="manualSyncModal">
      <span class="close">&times;</span>
      <h2>Sinkronisasi Manual</h2>
      <form id="manualSyncDataForm">
        
        <div class="form-group">
          <label for="startDate">Tanggal Mulai</label>
          <input type="date" id="startDate" name="startDate" required/>
        </div>
        
        <div class="form-group">
          <button type="submit">Sinkronkan Data</button>
        </div> 
      </form>
    </div>
    `;

  // Tampilkan modal dengan konten
  const modal = showModal(modalContent);

  document
    .getElementById("manualSyncDataForm")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const dateValue = modal.querySelector("#startDate").value;
      const selectedDate = new Date(dateValue);
      console.log("selectedDate", selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set waktu hari ini ke 00:00:00 untuk perbandingan yang akurat

      console.log("t0day", today);
      console.log("is?", selectedDate > today);
      // Periksa apakah tanggal yang dipilih kurang dari hari ini
      if (selectedDate > today) {
        Swal.fire({
          title: "Kesalahan",
          text: "Tanggal yang dipilih harus kurang dari hari ini.",
          icon: "error",
          confirmButtonText: "OK",
          customClass: {
            popup: "swal2-small",
          },
        });
      } else {
        // console.log("dateValue", dateValue);
        Swal.fire({
          title: "Konfirmasi",
          text: `Apakah Anda yakin ingin sinkronisasi data sejak tanggal ${dateValue}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, sinkronisasi!",
          cancelButtonText: "Tidak, batalkan",
          customClass: {
            popup: "swal2-small",
          },
        }).then(async (result) => {
          if (result.isConfirmed) {
            await logDatesSince(dateValue, true);
            closeModal(modal);
            Swal.fire({
              icon: "success",
              title: "Sinkronisasi Selesai",
              text: "Semua data telah berhasil disinkronkan.",
              customClass: {
                popup: "swal2-small",
              },
              confirmButtonText: "OK",
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          }
        });
      }

      // Tampilkan swal success setelah looping selesai
    });

  // Tambahkan event listener untuk menutup modal
  modal.querySelector(".close").addEventListener("click", () => {
    modal.style.display = "none";
  });
}

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
    await callDataShell();
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
    await callDataShell();
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

export async function hariDariTanggal(tanggal) {
  const dateParts = tanggal.split("-");
  const tahun = parseInt(dateParts[0]);
  const bulan = parseInt(dateParts[1]) - 1; // Bulan di JavaScript dimulai dari 0
  const tanggalInt = parseInt(dateParts[2]);

  const date = new Date(tahun, bulan, tanggalInt);
  const hari = date.toLocaleString("id-ID", { weekday: "long" });

  // console.log('hari', hari);
  return { hari };
}

async function hitungTotalCashDebit(data) {
  let totalCash = 0;
  let totalDebit = 0;

  if (!data || !data.barang || data.barang.length === 0) {
    return;
  }

  // Iterasi data barang
  data.barang.forEach((barang) => {
    if (barang.payment === "cash") {
      totalCash += barang.totalHarga;
    } else if (barang.payment === "debit") {
      totalDebit += barang.totalHarga;
    }
  });

  // Update totalCash dan totalDebit
  data.totalCash = totalCash || 0;
  data.totalDebit = totalDebit || 0;

  return { totalCash, totalDebit };
}