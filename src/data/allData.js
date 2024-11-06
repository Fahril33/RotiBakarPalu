import RBPsource from "./source";
import {
  datePickerValue,
  getYesterdayDate,
  minusOneDayDate,
} from "../scripts/utils/datePicker";

export async function allSalesDataByDate(date) {
  const allSalesDatas = await RBPsource.salesData();
  const todaySales = allSalesDatas.find((sale) => sale.date === date) || {};
  const soldTotal = todaySales.totalQuantity || 0;
  const incomeTotal = todaySales.totalIncome || 0;

  return {
    todaySales,
    soldTotal,
    incomeTotal,
  };
}

export async function allStockDataByDate(date) {
  const allStockDatas = await RBPsource.getStocks();
  // console.log("all stock bang", allStockDatas);
  const filteredData = allStockDatas.find((stock) => stock.date === date) || `none`;

  const {
    initial_stock: initialStock = 0,
    additional_stock: additionalStock = 0,
    bonus_stock: bonusStock = 0,
    spoiled_stock: spoiledStock = 0,
    sold_stock: soldStock = 0,
    total_stock: totalStock = 0,
    remaining_stock: remainingStock = 0,
  } = filteredData;

  return {
    filteredData,
    initialStock,
    additionalStock,
    bonusStock,
    spoiledStock,
    soldStock,
    totalStock,
    remainingStock,
  };
}

export async function allShoplistDataByDate(date) {
  const shoppingListData = await RBPsource.getDaftarBelanja();
  // console.log("date", date);

  const rotiData = shoppingListData.find(
    (entry) =>
      entry.tanggal === date &&
      entry.barang.some((item) => item.namaBahan === "Roti")
  );

  console.log("rdata", rotiData);
  if (rotiData) {
    const rotiItem = rotiData.barang.find((item) => item.namaBahan === "Roti");
    const rotiQuantity = rotiItem ? rotiItem.jumlah : 0;
    console.log("roti segini", rotiQuantity);
    
    return { rotiQuantity };
  }
  return { rotiQuantity:0 };
}

export async function allStocksData() {
  const stocks = await RBPsource.getStocks();
  const datePicked = (await datePickerValue()).dateValue;
  const minusOneDayDateStock = (await minusOneDayDate()).resultDate;
  const minusOneDateValueStock =
    stocks.find((stock) => stock.date === minusOneDayDateStock) || 0;
  const todayStock = stocks.find((stock) => stock.date === datePicked) || 0;
  const yesterdayStock =
    stocks.find((stock) => stock.date === getYesterdayDate().yesterday) || {};
  const {
    initial_stock: initialStock = 0,
    additional_stock: additionalStock = 0,
    bonus_stock: bonusStock = 0,
    spoiled_stock: spoiledStock = 0,
    sold_stock: soldStock = 0,
    total_stock: totalStock = 0,
    remaining_stock: remainingStock = 0,
  } = todayStock;
  const { remaining_stock: yesterdayRemainingStock = 0 } = yesterdayStock;
  const { remaining_stock: minusOneDayDateRemainingStock = 0 } =
    minusOneDateValueStock;

  return {
    datePicked,
    todayStock,
    initialStock,
    additionalStock,
    bonusStock,
    spoiledStock,
    soldStock,
    totalStock,
    remainingStock,
    yesterdayRemainingStock,
    minusOneDayDateRemainingStock,
  };
}

export async function allSalesData() {
  const sales = await RBPsource.salesData();
  const datePicked = (await datePickerValue()).dateValue;
  const todaySales = sales.find((sale) => sale.date === datePicked) || {};
  const soldTotal = todaySales.totalQuantity || 0;
  const incomeTotal = todaySales.totalIncome || 0;

  return {
    datePicked,
    todaySales,
    soldTotal,
    incomeTotal,
  };
}

export async function allShoppingListData() {
  const shoppingListData = await RBPsource.getDaftarBelanja();
  const datePicked = (await datePickerValue()).dateValue;
  const selectedDateShoppingListData = shoppingListData.find(
    (data) => data.tanggal === datePicked
  );

  const rotiData = shoppingListData.find(
    (entry) =>
      entry.tanggal === datePicked &&
      entry.barang.some((item) => item.namaBahan === "Roti")
  );
  const rotiItem = rotiData.barang.find((item) => item.namaBahan === "Roti");
  const rotiQuantity = rotiItem ? rotiItem.jumlah : 0;

  return { selectedDateShoppingListData, rotiQuantity };
}
