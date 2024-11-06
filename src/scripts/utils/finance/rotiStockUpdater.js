import {
  isAnyStockDataShell,
  putStockData,
  putNewStockData,
} from "../../../data/utils/stockHandler";
import RBPsource from "../../../data/source";
import { allSalesData, allStocksData } from "../../../data/allData";
// import API_ENDPOINT from "../../../config/config";

export async function updateRotiStock() {
  const updatedData = await RBPsource.getDaftarBelanja();
  const todayDate = document.getElementById("dataDatePicker").value;
  const yesterdayRemainingStock = (await allStocksData())
    .minusOneDayDateRemainingStock;
  const todaySoldStock = (await allSalesData()).soldTotal;

  const rotiData = updatedData.find(
    (entry) =>
      entry.tanggal === todayDate &&
      entry.barang.some((item) => item.namaBahan === "Roti")
  );

  if (rotiData) {
    await isAnyStockDataShell(todayDate);

    const rotiItem = rotiData.barang.find((item) => item.namaBahan === "Roti");
    const rotiQuantity = rotiItem ? rotiItem.jumlah : 0;
    console.log("stok baru", rotiQuantity);
    console.log("stok kemarin", yesterdayRemainingStock);
    console.log("rotiQTY", rotiQuantity);

    let todayTotalStock = yesterdayRemainingStock + rotiQuantity;
    let todayRemainingStock = todayTotalStock - todaySoldStock;

    putStockData(
      todayDate,
      yesterdayRemainingStock,
      rotiQuantity,
      todayTotalStock,
      todayRemainingStock
    );
  } else {
    let todayRemainingStock = yesterdayRemainingStock - todaySoldStock;
    const stockData = {
      additional_stock: 0,
      remaining_stock: todayRemainingStock,
      total_stock: yesterdayRemainingStock,
    };

    await putNewStockData(todayDate, stockData);
  }
}
