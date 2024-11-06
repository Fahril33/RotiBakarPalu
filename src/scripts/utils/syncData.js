// import { minusOneDayStockData } from "../../data/allData";
import { allSalesDataByDate, allShoplistDataByDate, allStockDataByDate } from "../../data/allData";
import { isAnyStockDataShell, putNewStockData } from "../../data/utils/stockHandler";
import { datePickerValue } from "./datePicker";

// Tambahkan fungsi ini di luar logDatesSince
async function subtractOneDay(dateString) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function logDatesSince() {
  let dateValue = (await datePickerValue()).dateValue;

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
      showLoader(true, formattedDate);

      const formattedDateMinusOne = await subtractOneDay(formattedDate);

      // 
      // Sync Stock
      // 
      let initialStock = (await allStockDataByDate(formattedDateMinusOne)).remainingStock;
      let additionalStock =  (await allShoplistDataByDate(formattedDate)).rotiQuantity;
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
      }
      
      let isAvailable = (await allStockDataByDate(formattedDate)).filteredData;
      if (isAvailable === `none`) {
        console.log("gaada bang, wait ditambahin");
        await isAnyStockDataShell(formattedDate)
        await putNewStockData(formattedDate, stockData);
        console.log("oke udah ditambahin");
        
      } else {
        await putNewStockData(formattedDate, stockData);
        console.log("ada bang");
        console.log("ini bang", isAvailable);
      }

      // Tambahkan jeda sebelum melanjutkan ke tanggal berikutnya
      await new Promise((resolve) => setTimeout(resolve, 1000)); // jeda 1 detik
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

function showLoader(isLoading, date) {
  const loader = document.querySelector(".custom-loader");
  const overlay = document.querySelector(".overlay");
  const loaderText = document.querySelector(".loader-text");

  if (isLoading) {
    overlay.style.display = "block"; // Tampilkan overlay
    loader.style.display = "flex"; // Tampilkan loader
    loaderText.textContent = `Sinkronasi Data: ${date}`; // Tampilkan tanggal yang sedang diproses
  } else {
    overlay.style.display = "none"; // Sembunyikan overlay
    loader.style.display = "none"; // Sembunyikan loader
  }
}
