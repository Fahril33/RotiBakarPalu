import { allFinanceDataByDate } from "../../../data/allData";
import { bacaHariLibur } from "../../../data/source";
import { getCurrentDate } from "../datePicker";

export async function displayFinance() {
  try {
    console.log('jalan nih', );
    const currentDate = getCurrentDate().pickedDate
    const financeData = await allFinanceDataByDate(currentDate);

    const todayCash = financeData.totalCash;
    const todayDebit = financeData.totalDebit;
    const todayTotal = todayCash + todayDebit;

    const totalIncome = financeData.totalIncome;
    const totalExpense = financeData.totalExpense;
    const totalProfit = financeData.profit;

    // Kosongkan isi elemen sebelum mengubahnya
    const cashElement = document.querySelector("#TodayCash");
    cashElement.textContent = ""; // Mengosongkan isi
    cashElement.textContent = `Rp. ${todayCash.toLocaleString("id-ID")}`;

    const debitElement = document.querySelector("#todayCredit");
    debitElement.textContent = ""; // Mengosongkan isi
    debitElement.textContent = `Rp. ${todayDebit.toLocaleString("id-ID")}`;

    const totalElement = document.querySelector("#todayTotal");
    totalElement.textContent = ""; // Mengosongkan isi
    totalElement.textContent = `Rp. ${todayTotal.toLocaleString("id-ID")}`;

    const incomeElement = document.querySelector("#incomeTM");
    incomeElement.textContent = ""; // Mengosongkan isi
    incomeElement.textContent = `Rp. ${totalIncome.toLocaleString("id-ID")}`;

    const expenseElement = document.querySelector("#expenseTM");
    expenseElement.textContent = ""; // Mengosongkan isi
    expenseElement.textContent = `Rp. ${totalExpense.toLocaleString("id-ID")}`;

    const profitElement = document.querySelector("#profitTM");
    profitElement.textContent = ""; // Mengosongkan isi
    profitElement.textContent = `Rp. ${totalProfit.toLocaleString("id-ID")}`;
  } catch (error) {
    console.error("Error displaying finance data:", error);
  }
}

export async function displayUpcomingEvent(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nowYear = String(today.getFullYear());
  const nextYear = parseInt(nowYear, 10) + 1;

  const catchEventThisYear = await bacaHariLibur(date, nowYear);
  const catchEventNextYear = await bacaHariLibur(date, nextYear);
  const eventList = [
    {
      year: nowYear,
      events: catchEventThisYear.semuaHariLibur,
    },
    {
      year: nextYear,
      events: catchEventNextYear.semuaHariLibur,
    },
  ];
  const allEvents = eventList[0].events.concat(eventList[1].events);
  //   console.log("event List", allEvents);

  const activityContainer = document.querySelector(".activity-container");
  const upcomingEvents = allEvents.filter(
    (event) => new Date(event.holiday_date) >= today
  );
//   console.log("upcoming evn", upcomingEvents);

  // Mengurutkan upcomingEvents berdasarkan holiday_date
  upcomingEvents.sort(
    (a, b) => new Date(a.holiday_date) - new Date(b.holiday_date)
  );

  // Kemudian, lanjutkan dengan menampilkan event seperti sebelumnya
  upcomingEvents.forEach((event, index) => {
    const activityItem = document.createElement("div");
    activityItem.classList.add("activity-item");

    const activityCircle = document.createElement("div");
    activityCircle.classList.add("activity-circle");
    activityCircle.textContent = index + 1; // Menambahkan nomor urut

    const activityText = document.createElement("div");
    activityText.classList.add("activity-text");
    activityText.textContent = `${event.holiday_date} - ${event.holiday_name}`; // Mengisi dengan data

    activityItem.appendChild(activityCircle);

    // Tambahkan activity-line hanya jika ada data berikutnya
    if (index < upcomingEvents.length - 1) {
      const activityLine = document.createElement("div");
      activityLine.classList.add("activity-line");
      activityItem.appendChild(activityLine);
    }

    activityItem.appendChild(activityText);
    activityContainer.appendChild(activityItem);
  });
}
