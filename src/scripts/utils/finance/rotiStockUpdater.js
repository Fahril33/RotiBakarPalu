import {
  putStockData,
  putNewStockData,
  isStocksDataExist,
} from "../../../data/utils/stockHandler";
import RBPsource from "../../../data/source";
import { allSalesData, allStocksData } from "../../../data/allData";
import { displayFinance } from "./financialDisplayer";
// import API_ENDPOINT from "../../../config/config";

export async function updateRotiStock() {
  const updatedData = await RBPsource.getDaftarBelanja();
  const todayDate = document.getElementById("dataDatePicker").value;
  const yesterdayRemainingStock = (await allStocksData())
    .minusOneDayDateRemainingStock;
  const spoiledStock = (await allStocksData()).spoiledStock
  const todaySoldStock = (await allSalesData()).soldTotal;

  const rotiData = updatedData.find((entry) => entry.tanggal === todayDate);

  if (rotiData) {
    await isStocksDataExist();
    // console.log("batalin isanystockdatashell");

    const rotiItems = rotiData.barang.filter((item) =>
      item.namaBahan.toLowerCase().startsWith("roti")
    );
    const rotiQuantity = rotiItems.reduce(
      (total, item) => total + item.jumlah,
      0
    );

    console.log("stok baru", rotiQuantity);
    console.log("stok kemarin", yesterdayRemainingStock);
    console.log("rotiQTY", rotiQuantity);

    let todayTotalStock = yesterdayRemainingStock + rotiQuantity;
    let todayRemainingStock = todayTotalStock - todaySoldStock - spoiledStock;

    putStockData(
      todayDate,
      yesterdayRemainingStock,
      rotiQuantity,
      todayTotalStock,
      todayRemainingStock
    );
  } else {
    let todayRemainingStock = yesterdayRemainingStock - todaySoldStock - spoiledStock;
    const stockData = {
      additional_stock: 0,
      remaining_stock: todayRemainingStock,
      total_stock: yesterdayRemainingStock,
    };

    await putNewStockData(todayDate, stockData);
  }
  displayFinance();
}
