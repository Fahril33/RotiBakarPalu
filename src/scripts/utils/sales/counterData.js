import { allStocksData, allSalesData } from "../../../data/allData";
import { updateSoldStockData } from "../../../data/utils/stockHandler";
import { datePickerValue } from "../datePicker";

export async function displayerSold() {
  const stockData = (await allStocksData()).totalStock;
  const nowRemainingStock = (await allStocksData()).remainingStock;
  const salesData = (await allSalesData()).soldTotal;
  let remainingStock = stockData - salesData; 
  // console.log("stockdata", (await allStocksData()).totalStock);
  // console.log("rstock", remainingStock);
  
  const soldElement = document.querySelector("#soldCount");
  soldElement.textContent = `Terjual ${salesData}/${stockData}`;

  const dateValue = (await datePickerValue()).dateValue;

  if (nowRemainingStock != remainingStock) {
    await updateSoldStockData(salesData, remainingStock, dateValue);
  }else{
    // console.log("data sama aja");
  }
} 

export async function displayerIncome() {
  const salesData = await allSalesData();
  const incomeElement = document.querySelector("#incomeCount");
  incomeElement.textContent = `Penjualan : ${salesData.incomeTotal.toLocaleString(
    "id-ID"
  )}`;
}
