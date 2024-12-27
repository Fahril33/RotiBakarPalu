import { allFinanceDataByDate } from "../../../data/allData";
import { bacaHariLibur } from "../../../data/source";
import { getCurrentDate } from "../datePicker";

export async function displayFinance() {
  try {
    console.log('jalan nih', );
    const currentDate = getCurrentDate().pickedDate;
    const financeData = await allFinanceDataByDate(currentDate);

    const todayCash = financeData.totalCash;
    const todayDebit = financeData.totalDebit;
    const todayTotal = todayCash + todayDebit;

    const totalIncome = financeData.totalIncome;
    const totalExpense = financeData.totalExpense;
    const totalProfit = financeData.profit;

    // Cek apakah elemen-elemen berikut ada sebelum mengubahnya
    const cashElement = document.querySelector("#TodayCash");
    if (!cashElement) return;
    cashElement.textContent = "Memuat.."; // Mengosongkan isi
    cashElement.textContent = `Rp. ${todayCash.toLocaleString("id-ID")}`;

    const debitElement = document.querySelector("#todayCredit");
    if (!debitElement) return;
    debitElement.textContent = "Memuat.."; // Mengosongkan isi
    debitElement.textContent = `Rp. ${todayDebit.toLocaleString("id-ID")}`;

    const totalElement = document.querySelector("#todayTotal");
    if (!totalElement) return;
    totalElement.textContent = "Memuat.."; // Mengosongkan isi
    totalElement.textContent = `Rp. ${todayTotal.toLocaleString("id-ID")}`;

    const incomeElement = document.querySelector("#incomeTM");
    if (!incomeElement) return;
    incomeElement.textContent = "Memuat.."; // Mengosongkan isi
    incomeElement.textContent = `Rp. ${totalIncome.toLocaleString("id-ID")}`;

    const expenseElement = document.querySelector("#expenseTM");
    if (!expenseElement) return;
    expenseElement.textContent = "Memuat.."; // Mengosongkan isi
    expenseElement.textContent = `Rp. ${totalExpense.toLocaleString("id-ID")}`;

    const profitElement = document.querySelector("#profitTM");
    if (!profitElement) return;
    profitElement.textContent = "Memuat.."; // Mengosongkan isi
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

  const errorEventElement = document.querySelector(".liburError");
  const loaderEventElement = document.querySelector("#liburLoader");
  if (errorEventElement && loaderEventElement) {
    errorEventElement.style.display = "none";
    if (!catchEventThisYear || !catchEventNextYear) {
      errorEventElement.style.display = "block";
      return;
    }
  }

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
  if (activityContainer) {
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
  if (errorEventElement) {
    errorEventElement.style.display = "none";
  }
  if (loaderEventElement) {
    loaderEventElement.style.display = "none";
  }
}
