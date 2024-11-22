import RBPsource from "./source";
import {
  datePickerValue,
  getCurrentDate,
  getYesterdayDate,
  minusOneDayDate,
} from "../scripts/utils/datePicker";

export async function allSalesDataByDate(date) {
  const allSalesDatas = await RBPsource.salesData();
  const todaySales = allSalesDatas.find((sale) => sale.date === date) || {};
  const soldTotal = todaySales.totalQuantity || 0;
  const incomeTotal = todaySales.totalIncome || 0;
  const totalMerchantIncome = todaySales.totalMerchantIncome || 0;
  const totalOutletIncome = todaySales.totalOutletIncome || 0;

  return {
    todaySales,
    soldTotal,
    incomeTotal,
    totalMerchantIncome,
    totalOutletIncome,
  };
}

export async function allStockDataByDate(date) {
  const allStockDatas = await RBPsource.getStocks();
  // console.log("all stock bang", allStockDatas);
  const filteredData =
    allStockDatas.find((stock) => stock.date === date) || `none`;

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
  const todayShoplist =
    shoppingListData.find((item) => item.tanggal === date) || {};
  const totalShopCash = todayShoplist.totalCash || 0;
  const totalShopDebit = todayShoplist.totalDebit || 0;
  const totalBelanja = todayShoplist.totalBelanja || 0;

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

    return { rotiQuantity, totalShopCash, totalShopDebit, totalBelanja };
  }
  return { rotiQuantity: 0, totalShopCash, totalShopDebit, totalBelanja };
}

export async function allFinanceDataByDate(date) {
  const allFinanceData = await RBPsource.getFinances();
  const filteredData =
    allFinanceData.find((item) => item.date === date) || `none`;

  const filteredDataThisMonth = allFinanceData.filter((item) => {
    const itemDate = new Date(item.date);
    const itemMonth = itemDate.getMonth() + 1; // Menambahkan 1 karena getMonth() mulai dari 0
    const itemYear = itemDate.getFullYear();
    const monthToFilter = parseInt(getCurrentDate().month, 10);
    const yearToFilter = parseInt(getCurrentDate().year, 10);

    return itemMonth === monthToFilter && itemYear === yearToFilter;
  });

  // Inisialisasi total
  let totalIncome = 0;
  let totalExpense = 0;

  // Hitung total pemasukan dan pengeluaran
  filteredDataThisMonth.forEach((item) => {
    totalIncome += item.in_cash + item.in_debit; // Total pemasukan
    totalExpense += item.out_cash + item.out_debit; // Total pengeluaran
  });

  // Hitung keuntungan
  const profit = totalIncome - totalExpense;

  const {
    in_cash: inCash = 0,
    in_debit: inDebit = 0,
    out_cash: outCash = 0,
    out_debit: outDebit = 0,
    total_cash: totalCash = 0,
    total_debit: totalDebit = 0,
    cash_to_debit: cashToDebit = 0,
    debit_to_cash: debitToCash = 0,
  } = filteredData;

  return {
    filteredDataThisMonth,
    totalIncome,
    totalExpense,
    profit,
    filteredData,
    inCash,
    inDebit,
    outCash,
    outDebit,
    totalCash,
    totalDebit,
    cashToDebit,
    debitToCash,
  };
}

export async function allPredictionDataByDate(dates) {
  const allPredictionData = await RBPsource.getPredictions();
  const filteredData =
    allPredictionData.find((data) => data.date === dates) || `none`;

  const {
    cuaca_besok: cuacaBesok = "none",
    cuaca: cuaca = "none",
    weekend: weekend = "none",
    libur: libur = "none",
    event_raya: raya = "untracked",
    hasil_prediksi: hasilPrediksi = "none",
    operasional: operasional = "none",
  } = filteredData;

  return {
    filteredData,
    cuaca,
    cuacaBesok,
    weekend,
    libur,
    raya,
    hasilPrediksi,
    operasional,
  };
}

export async function allStocksData() {
  const stocks = await RBPsource.getStocks();
  const datePicked = (await datePickerValue()).dateValue;
  const minusOneDayDateValue = (await minusOneDayDate()).resultDate;
  const minusOneDateValueStock =
    stocks.find((stock) => stock.date === minusOneDayDateValue) || 0;
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
