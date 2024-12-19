import API_ENDPOINT from "../../config/config";
import {
  getCurrentDate,
  getYesterdayDate,
} from "../../scripts/utils/datePicker";
import {
  allFinanceDataByDate,
  allSalesDataByDate,
  allShoplistDataByDate,
} from "../allData";

export async function postFinance(financeData) {
  console.log("fdata", financeData);
  try {
    const response = await fetch(`${API_ENDPOINT.FINANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(financeData),
    });

    if (!response.ok) {
      const errorText = await response.text(); // Ambil teks kesalahan
      throw new Error(
        `Gagal menyimpan data finance. Status: ${response.status}, Message: ${errorText}`
      );
    }
    const data = await response.json();
    console.log("Data finance berhasil disimpan melalui POST:", data);
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan POST data finance:", error);
  }
}

export async function putFinanceData(financeData, date) {
// console.log('fidata',date,":", financeData);
  try {
    const response = await fetch(`${API_ENDPOINT.FINANCE}/date/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(financeData),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data finance.");
    }
    // console.log("Data finance berhasil diperbarui melalui PUT.");
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan PUT data finance:", error);
  }
}

export async function deleteFinanceData(date) {
  try {
    const response = await fetch(`${API_ENDPOINT.FINANCE}/date/${date}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete finance data with date ${date}.`);
    }

    const result = await response.json();
    console.log("Finance data successfully deleted:", result);
  } catch (error) {
    console.error("An error occurred while deleting Finance data:", error);
  }
}

export async function isTodayDataExist() {
  const recentDate = getCurrentDate().pickedDate;
  const yesterdayDate = getYesterdayDate().yesterday;
  const anyFinanceData = (await allFinanceDataByDate(recentDate)).filteredData;

  if (anyFinanceData === `none`) {
    const inCash = (await allSalesDataByDate(recentDate)).totalOutletIncome;
    const inDebit = (await allSalesDataByDate(recentDate)).totalMerchantIncome;
    const outCash = (await allShoplistDataByDate(recentDate)).totalShopCash;
    const outDebit = (await allShoplistDataByDate(recentDate)).totalShopDebit;
    const ydayTotalCash = (await allFinanceDataByDate(yesterdayDate)).totalCash;
    const ydayTotalDebit = (await allFinanceDataByDate(yesterdayDate))
      .totalDebit;
    const cashToDebit = (await allFinanceDataByDate(recentDate)).cashToDebit;
    const debitToCash = (await allFinanceDataByDate(recentDate)).debitToCash;

    const financeData = {
      in_cash: inCash,
      in_debit: inDebit,
      out_cash: outCash,
      out_debit: outDebit,
      total_cash: ydayTotalCash + inCash - outCash - cashToDebit,
      total_debit: ydayTotalDebit + inDebit - outDebit - debitToCash,
      cash_to_debit: 0,
      debit_to_cash: 0,
    };
    console.log("calon data", financeData);
    postFinance(financeData);

    const newFinanceData = anyFinanceData;
    console.log("data dan shell recent gaada, nih yg baru bg", newFinanceData);
  } else {
    console.log("ada kok bang", anyFinanceData);
  }
}

export async function createNewFinanceDataShell(date) {
  const emptyData = {
    date: date,
    in_cash: 0,
    in_debit: 0,
    out_cash: 0,
    out_debit: 0,
    total_cash: 0,
    total_debit: 0,
    cash_to_debit: 0,
    debit_to_cash: 0,
  };
  postFinance(emptyData);
  const newFinanceData = (await allFinanceDataByDate(date)).filteredData;
  console.log("shell finance gaada, nih baru", newFinanceData);
}
