// import { minusOneDayStockData } from "../../data/allData";
import {
  allFinanceDataByDate,
  allSalesDataByDate,
  allShoplistDataByDate,
  allStockDataByDate,
} from "../../data/allData";
import {
  createNewFinanceDataShell,
  putFinanceData,
} from "../../data/utils/financeHandler";
import { syncSoldToPrediction } from "../../data/utils/predictionHandler";
import {
  isAnyStockDataShell,
  putNewStockData,
} from "../../data/utils/stockHandler";
import { getCurrentDate } from "./datePicker";

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
      if(logsince){
        let syncText = `Sinkronisasi data: ${formattedDate}`;
        showLoader(true, syncText);
      }else{
        let syncText = `Mengolah Pesanan`;
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
      if (isStockShellAvailable === `none`) {
        console.log("gaada bang, wait ditambahin");
        await isAnyStockDataShell(formattedDate);
        console.log("oke udah ditambahin, lanjut sinkron data stock");
        await putNewStockData(formattedDate, stockData);
        console.log(
          "Data stok untuk",
          formattedDate,
          "sinkron dengan",
          formattedDateMinusOne
        );
      } else {
        await putNewStockData(formattedDate, stockData);
        console.log("ada, ini bang", isStockShellAvailable);
      }

      //
      // Sync Stock To Prediction
      //
      await syncSoldToPrediction(formattedDate);

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
        total_cash: ydayTotalCash + inCash - outCash - cashToDebit,
        total_debit: ydayTotalDebit + inDebit - outDebit - debitToCash,
      };

      console.log("calon data", financeData);

      let isFinanceShellAvailable = (await allFinanceDataByDate(formattedDate))
        .filteredData;
      if (isFinanceShellAvailable === `none`) {
        console.log("gaada shell bang, wait ditambahin dulu");
        await createNewFinanceDataShell(formattedDate);
        console.log("oke udah ditambahin, lanjut sinkron data finance");
        await putFinanceData(financeData, formattedDate);
        console.log(
          "Data finance untuk",
          formattedDate,
          "sinkron dengan",
          formattedDateMinusOne
        );
      } else {
        console.log(
          "shell ada nih bang:",
          isFinanceShellAvailable,
          "skip ke sinkron data"
        );
        await putFinanceData(financeData, formattedDate);
        console.log(
          "Data finance untuk",
          formattedDate,
          "sinkron dengan",
          formattedDateMinusOne
        );
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
    console.log("The dateValue is not less than today's date.");
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

export async function callDataShell() {
  const currDate = getCurrentDate().pickedDate;
  console.log('currDate', currDate);
  await logDatesSince(currDate)
  // await checkWeatherData();
  // await getHolidayValue();
  // await usePrediction();
}
