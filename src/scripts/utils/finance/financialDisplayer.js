import { allFinanceDataByDate } from "../../../data/allData";
import RBPsource from "../../../data/source";
import { getCurrentDate } from "../datePicker";

export async function displayFinance(pickedDate) {
  console.log("ppd", pickedDate);
  const todayCash = (await allFinanceDataByDate(pickedDate)).totalCash;
  const todayDebit = (await allFinanceDataByDate(pickedDate)).totalDebit;
  const todayTotal = todayCash + todayDebit;

  const fdtm = (await allFinanceDataByDate(pickedDate)).filteredDataThisMonth;
  const totalIncome = (await allFinanceDataByDate(pickedDate)).totalIncome;
  const totalExpense = (await allFinanceDataByDate(pickedDate)).totalExpense;
  const totalProfit = (await allFinanceDataByDate(pickedDate)).profit;
  console.log("fdtm", fdtm);
//   console.log(`Total Pemasukan: ${totalIncome}`);
//   console.log(`Total Pengeluaran: ${totalExpense}`);
//   console.log(`Keuntungan: ${totalProfit}`);

  const cashElement = document.querySelector("#TodayCash");
  cashElement.textContent = `Rp. ${todayCash.toLocaleString("id-ID")}`;
  const debitElement = document.querySelector("#todayCredit");
  debitElement.textContent = `Rp. ${todayDebit.toLocaleString("id-ID")}`;
  const totalElement = document.querySelector("#todayTotal");
  totalElement.textContent = `Rp. ${todayTotal.toLocaleString("id-ID")}`;
  
  const incomeElement = document.querySelector("#incomeTM");
  incomeElement.textContent = `Rp. ${totalIncome.toLocaleString("id-ID")}`;
  const expenseElement = document.querySelector("#expenseTM");
  expenseElement.textContent = `Rp. ${totalExpense.toLocaleString("id-ID")}`;
  const profitElement = document.querySelector("#profitTM");
  profitElement.textContent = `Rp. ${totalProfit.toLocaleString("id-ID")}`;

}
