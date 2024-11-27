// import RBPsource, { bacaHariLibur, getHolidays } from "../../../data/source";

import RBPsource from "../../../data/source";
import { getCurrentDate } from "../../utils/datePicker";
import { createHomeTemplate } from "../template/template-creator";
import Chart from "chart.js/auto";

const Home = {
  async render() {
    return `
      <div class="content">
        ${createHomeTemplate()}
      </div>
    `;
  },

  async afterRender() {
    //
    // Filter Btn Handling
    //

    const financeFilter = document.getElementById("finance-filter");
    const financeFilterWeek = document.getElementById("finance-filter-week");
    const financeFilterMY = document.getElementById("finance-filter-my");
    const financeFilterY = document.getElementById("finance-filter-year");

    const defaultYear = getCurrentDate().year;
    const defaultMonth = getCurrentDate().month;
    financeFilterMY.value = `${defaultYear}-${defaultMonth}`;
    financeFilterY.value = `${defaultYear}`;

    // Menambahkan event listener untuk perubahan nilai
    financeFilter.addEventListener("change", function () {
      const selectedValue = this.value; // Mendapatkan nilai yang dipilih

      // Pengondisian berdasarkan opsi yang dipilih
      switch (selectedValue) {
        case "daily":
          // Fungsi untuk opsi Harian
          console.log("Opsi yang dipilih: Harian");
          financeFilterWeek.style.display = "block";
          financeFilterMY.style.display = "block";
          financeFilterY.style.display = "none";

          break;
        case "weekly":
          // Fungsi untuk opsi Mingguan
          console.log("Opsi yang dipilih: Mingguan");
          financeFilterWeek.style.display = "none";
          financeFilterMY.style.display = "block";
          financeFilterY.style.display = "none";
          // Tambahkan fungsi yang diinginkan di sini
          break;
        case "monthly":
          // Fungsi untuk opsi Bulanan
          console.log("Opsi yang dipilih: Bulanan");
          financeFilterWeek.style.display = "none";
          financeFilterMY.style.display = "none";
          financeFilterY.style.display = "block";
          // Tambahkan fungsi yang diinginkan di sini
          break;
        // case 'yearly':
        //     // Fungsi untuk opsi Pertahun
        //     console.log("Opsi yang dipilih: Pertahun");
        //     // Tambahkan fungsi yang diinginkan di sini
        //     break;
        default:
          console.log("Opsi tidak dikenali");
      }
      displayFinancialCharts();
    });

    //
    // Finance Chart Handler
    //
    const allFinanceData = await RBPsource.getFinances();
    console.log("alfidata", allFinanceData);

    // Fungsi untuk memfilter data berdasarkan tahun, bulan, dan minggu
    function filterFinanceData(
      filterType,
      data,
      targetYear,
      targetMonth,
      targetWeek
    ) {
      // Filter berdasarkan tahun dan bulan
      const filteredByYearAndMonth = data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === targetYear &&
          itemDate.getMonth() === targetMonth
        );
      });

      // Mendapatkan minggu dari tanggal yang telah difilter
      const weeks = {};
      const months = {}; // Untuk menyimpan data bulanan

      filteredByYearAndMonth.forEach((item) => {
        const itemDate = new Date(item.date);
        const weekNumber = getWeekNumberInMonth(itemDate);
        const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`; // Kunci untuk bulan

        // Kelompokkan berdasarkan minggu
        if (!weeks[weekNumber]) {
          weeks[weekNumber] = [];
        }
        weeks[weekNumber].push(item);

        // Kelompokkan berdasarkan bulan
        if (
          !months[monthKey] ||
          new Date(item.date) > new Date(months[monthKey].date)
        ) {
          months[monthKey] = item; // Simpan item terbaru untuk bulan ini
        }
      });

      if (filterType === "daily") {
        // Jika targetWeek adalah 'semua', kita ambil semua minggu
        if (targetWeek === "semua") {
          return weeks; // Kembalikan semua minggu
        } else {
          // Kembalikan data dari minggu yang dipilih
          return weeks[targetWeek] || [];
        }
      } else if (filterType === "weekly") {
        // Ambil data terbaru dari setiap minggu
        const latestWeeklyData = Object.keys(weeks).map((week) => {
          const weekItems = weeks[week];
          return weekItems.reduce((latest, current) => {
            return new Date(current.date) > new Date(latest.date)
              ? current
              : latest;
          });
        });
        console.log("latestWeeklyData:", latestWeeklyData);
        return latestWeeklyData;
      } else if (filterType === "monthly") {
        const latestMonthlyData = [];
        const months = {}; // Untuk menyimpan data bulanan

        // Mengelompokkan data berdasarkan bulan
        data.forEach((item) => {
          const itemDate = new Date(item.date);
          const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`; // Kunci untuk bulan

          // Simpan item terbaru untuk bulan ini
          if (
            !months[monthKey] ||
            new Date(item.date) > new Date(months[monthKey].date)
          ) {
            months[monthKey] = item;
          }
        });

        // Mengambil semua item terbaru dari setiap bulan
        Object.values(months).forEach((item) => {
          latestMonthlyData.push(item);
        });

        // Mengurutkan data berdasarkan tahun dan bulan
        latestMonthlyData.sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("latestMonthlyData:", latestMonthlyData);
        return latestMonthlyData;
      }
    }

    // Fungsi untuk mendapatkan nomor minggu dalam bulan
    function getWeekNumberInMonth(date) {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOfWeek = firstDayOfMonth.getDay(); // Hari pertama bulan ini
      const currentDay = date.getDate(); // Hari dari tanggal yang diberikan

      // Menghitung nomor minggu dalam bulan
      return Math.ceil((currentDay + dayOfWeek) / 7);
    }

    let myChart;
    async function displayFinancialCharts() {
      if (myChart) {
        myChart.destroy(); // Hancurkan chart yang ada
      }

      // ControllerFilter
      const selectedWeek = document.getElementById("finance-filter-week").value;
      const selectedMonth = document.getElementById("finance-filter-my").value;
      const [year, month] = selectedMonth.split("-").map(Number); // Memisahkan tahun dan bulan
      const yearInputValue = document.getElementById(
        "finance-filter-year"
      ).value;

      // Value Master
      const targetYear = year;
      const targetMonth = month - 1; // Bulan dimulai dari 0
      const targetWeek = selectedWeek; // Ganti dengan nomor minggu (misal: 1, 2, 3, 4) atau 'semua'
      const filterType = financeFilter.value; // Ambil jenis filter dari elemen UI
      const yearValue = yearInputValue;
      console.log("yearValue", yearValue);

      // Filter data
      const filteredData = filterFinanceData(
        filterType,
        allFinanceData,
        targetYear,
        targetMonth,
        targetWeek
      );

      console.log("Filtered Data:", filteredData);

      // Siapkan data untuk Chart.js
      let totalCashData = [];
      let totalDebitData = [];
      let totalData = [];
      let labels = []; // Inisialisasi array labels

      // Jika targetWeek adalah 'semua', gabungkan data dari semua minggu
      if (targetWeek === "semua") {
        if (filterType === "daily") {
          for (const week in filteredData) {
            const weekData = filteredData[week];
            weekData.forEach((item) => {
              totalCashData.push(item.total_cash);
              totalDebitData.push(item.total_debit);
              totalData.push(item.total_cash + item.total_debit);
              labels.push(item.date);
            });
          }
        } else if (filterType === "weekly") {
          filteredData.forEach((item) => {
            totalCashData.push(item.total_cash);
            totalDebitData.push(item.total_debit);
            totalData.push(item.total_cash + item.total_debit);
            labels.push(item.date);
          });
        } else if (filterType === "monthly") {
          filteredData.forEach((item) => {
            totalCashData.push(item.total_cash);
            totalDebitData.push(item.total_debit);
            totalData.push(item.total_cash + item.total_debit);

            const itemDate = new Date(item.date);
            const monthName = itemDate.toLocaleString("default", {
              month: "long",
            }); // Mendapatkan nama bulan
            labels.push(monthName); // Menambahkan nama bulan ke label
          });
        }
      } else {
        // Jika targetWeek bukan 'semua', ambil data dari minggu yang dipilih
        const weekData = filteredData || [];
        totalCashData = weekData.map((item) => item.total_cash);
        totalDebitData = weekData.map((item) => item.total_debit);
        totalData = weekData.map((item) => item.total_cash + item.total_debit);
        labels = weekData.map((item) => item.date);
      }

      // Buat grafik dengan Chart.js
      callFinancialChart(labels, totalCashData, totalDebitData, totalData);
    }

    function callFinancialChart(
      labels,
      totalCashData,
      totalDebitData,
      totalData
    ) {
      const ctx = document.getElementById("acquisitions").getContext("2d");
      myChart = new Chart(ctx, {
        type: "line", // Jenis grafik
        data: {
          labels: labels,
          datasets: [
            {
              label: "Total Cash",
              data: totalCashData,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
            {
              label: "Total Debit",
              data: totalDebitData,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
            },
            {
              label: "Total (Cash + Debit)",
              data: totalData,
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
    displayFinancialCharts();
    // Menambahkan event listener untuk financeFilterWeek
    financeFilterWeek.addEventListener("change", async function () {
      const selectedWeek = this.value; // Mendapatkan nilai yang dipilih
      console.log("Minggu yang dipilih:", selectedWeek);

      await displayFinancialCharts();
    });

    // Menambahkan event listener untuk financeFilterMY
    financeFilterMY.addEventListener("change", async function () {
      const selectedMonthValue = this.value; // Mendapatkan nilai yang dipilih (format: YYYY-MM)
      const [year, month] = selectedMonthValue.split("-"); // Memisahkan tahun dan bulan
      console.log("Tahun yang dipilih:", year);
      console.log("Bulan yang dipilih:", month);

      await displayFinancialCharts();
    });
  },
};

export default Home;
