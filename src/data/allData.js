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
    // console.log('itemdate', itemDate);
    const itemMonth = itemDate.getMonth() + 1; // Menambahkan 1 karena getMonth() mulai dari 0
    // console.log('itemmonth', itemMonth);
    const itemYear = itemDate.getFullYear();
    const monthToFilter = parseInt(getCurrentDate().month, 10);
    // console.log('monthToFilter', monthToFilter);
    const yearToFilter = parseInt(getCurrentDate().year, 10);
    // console.log('yeartofilter', yearToFilter);

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

  // console.log('ftdfi', filteredDataThisMonth);

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
    akurat: akurat = "none"
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
    akurat,
  };
}

export function getFinanceDataForMonth(allFinanceData, month, year) {
  const filteredData = allFinanceData.filter((item) => {
    const itemDate = new Date(item.date);
    const itemMonth = itemDate.getMonth() + 1; // Menambahkan 1 karena getMonth() mulai dari 0
    const itemYear = itemDate.getFullYear();

    return itemMonth === month && itemYear === year;
  });

  // Inisialisasi total
  let totalIncome = 0;
  let totalExpense = 0;

  // Hitung total pemasukan dan pengeluaran
  filteredData.forEach((item) => {
    totalIncome += item.in_cash + item.in_debit; // Total pemasukan
    totalExpense += item.out_cash + item.out_debit; // Total pengeluaran
  });

  // Hitung keuntungan
  const profit = totalIncome - totalExpense;

  return {
    filteredData,
    totalIncome,
    totalExpense,
    profit,
  };
}

export async function allFinanceDataThisMonth(selectedMonth, selectedYear) {
  const financeData = await RBPsource.getFinances();

  // Validasi input
  if (!selectedMonth || !financeData) {
    return {
      totalInCash: 0,
      totalInDebit: 0,
      totalOutCash: 0,
      totalOutDebit: 0
    };
  }

  // Filter data berdasarkan bulan yang dipilih
  const filteredData = financeData.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getMonth() === selectedMonth - 1 &&
      itemDate.getFullYear() === parseInt(selectedYear,10)
    ); // Tambahkan filter tahun
  });
  // console.log('filtredmtdata', filteredData);

  // Hitung total
  const result = filteredData.reduce(
    (acc, curr) => {
      return {
        totalInCash: acc.totalInCash + (curr.in_cash || 0),
        totalInDebit: acc.totalInDebit + (curr.in_debit || 0),
        totalOutCash: acc.totalOutCash + (curr.out_cash || 0),
        totalOutDebit: acc.totalOutDebit + (curr.out_debit || 0)
        
      };
    },
    {
      totalInCash: 0,
      totalInDebit: 0,
      totalOutCash: 0,
      totalOutDebit: 0
    }
    
  );

  return result;
}

export async function getFinanceDataByYearMonthWeek(year, month, week) {
  const financeData = await RBPsource.getFinances();

  // Validasi input
  if (!year || !month || !week || !financeData) {
    return {
      totalInCash: 0,
      totalInDebit: 0,
      totalOutCash: 0,
      totalOutDebit: 0,
      netTotalCash: 0,
      netTotalDebit: 0,
    };
  }

  // Filter data berdasarkan tahun, bulan, dan minggu
  const filteredData = financeData.filter((item) => {
    const itemDate = new Date(item.date);

    // Cek tahun
    if (itemDate.getFullYear() !== year) return false;

    // Cek bulan (ingat bulan di JavaScript dimulai dari 0)
    if (itemDate.getMonth() !== month - 1) return false;

    // Hitung minggu
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const firstWeekDay = firstDayOfMonth.getDay(); // Hari pertama bulan (0-6)

    // Hitung rentang tanggal untuk minggu yang dipilih
    const weekStart = 1 + (week - 1) * 7 - firstWeekDay;
    const weekEnd = weekStart + 6;

    // Cek apakah tanggal item berada dalam rentang minggu yang dipilih
    const dayOfMonth = itemDate.getDate();
    return dayOfMonth >= weekStart && dayOfMonth <= weekEnd;
  });

  // Hitung total
  const result = filteredData.reduce(
    (acc, curr) => {
      return {
        totalInCash: acc.totalInCash + (curr.in_cash || 0),
        totalInDebit: acc.totalInDebit + (curr.in_debit || 0),
        totalOutCash: acc.totalOutCash + (curr.out_cash || 0),
        totalOutDebit: acc.totalOutDebit + (curr.out_debit || 0),
        netTotalCash: acc.netTotalCash + (curr.total_cash || 0),
        netTotalDebit: acc.netTotalDebit + (curr.total_debit || 0),
        items: [...(acc.items || []), curr], // Opsional: simpan item yang terfilter
      };
    },
    {
      totalInCash: 0,
      totalInDebit: 0,
      totalOutCash: 0,
      totalOutDebit: 0,
      netTotalCash: 0,
      netTotalDebit: 0,
      items: [],
    }
  );

  // Hapus properti items jika tidak diperlukan
  const {...finalResult } = result;

  return {
    ...finalResult,
    // Opsional: tambahkan detail minggu
    weekDetails: {
      year,
      month,
      week,
      startDate: new Date(
        year,
        month - 1,
        1 + (week - 1) * 7 - new Date(year, month - 1, 1).getDay()
      ),
      endDate: new Date(
        year,
        month - 1,
        1 + (week - 1) * 7 - new Date(year, month - 1, 1).getDay() + 6
      ),
    },
  };
}

export async function allStockDataThisMonth(selectedMonth, selectedYear) {
  const stockData = await RBPsource.getStocks();

  // Validasi input
  if (!selectedMonth || !stockData) {
    return {
      totalInitialStock: 0,
      totalAdditionalStock: 0,
      totalBonusStock: 0,
      totalSpoiledStock: 0,
      totalSoldStock: 0,
      totalRemainingStock: 0,
    };
  }

  // Filter data berdasarkan bulan yang dipilih
  const filteredData = stockData.filter((item) => {
    const itemDate = new Date(item.date);
    return (
      itemDate.getMonth() === selectedMonth - 1 &&
      itemDate.getFullYear() === parseInt(selectedYear, 10)
    ); // Tambahkan filter tahun
  });

  // Hitung total
  const result = filteredData.reduce(
    (acc, curr) => {
      return {
        totalInitialStock: acc.totalInitialStock + (curr.initial_stock || 0),
        totalAdditionalStock:
          acc.totalAdditionalStock + (curr.additional_stock || 0),
        totalBonusStock: acc.totalBonusStock + (curr.bonus_stock || 0),
        totalSpoiledStock: acc.totalSpoiledStock + (curr.spoiled_stock || 0),
        totalSoldStock: acc.totalSoldStock + (curr.sold_stock || 0),
        totalRemainingStock:
          acc.totalRemainingStock + (curr.remaining_stock || 0),
      };
    },
    {
      totalInitialStock: 0,
      totalAdditionalStock: 0,
      totalBonusStock: 0,
      totalSpoiledStock: 0,
      totalSoldStock: 0,
      totalRemainingStock: 0,
    }
  );

  return result;
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
