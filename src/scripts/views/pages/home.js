// import RBPsource, { bacaHariLibur, getHolidays } from "../../../data/source";

import Swal from "sweetalert2";
import {
  allFinanceDataByDate,
  allFinanceDataThisMonth,
  allPredictionDataByDate,
  allStockDataThisMonth,
} from "../../../data/allData";
import RBPsource from "../../../data/source";
import {
  getCurrentDate,
  getTomorrowDate,
  getYesterdayDate,
} from "../../utils/datePicker";
import { checkUserRole } from "../../utils/interceptor";

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
    const token = localStorage.getItem("token");
    // Logika redirect untuk logout
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    const isAllow = await checkUserRole();
    console.log("isallow", isAllow);
    if (!isAllow) {
      window.location.hash = "#/sales";
      Swal.fire({
        title: "Akses Ditolak!",
        text: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        // Redirect ke halaman lain, misalnya halaman beranda
      });
      return; // Hentikan proses render
    }

    const defaultYear = getCurrentDate().year;
    // console.log("defaultY", defaultYear);
    const defaultMonth = getCurrentDate().month;
    // console.log("defaultmongth", defaultMonth);

    //
    // Prediction Chart
    //

    const allPredictionData = (await RBPsource.getPredictions()).filter(
      (item) => item.operasional === true
    );
    this.displayPredictionChart(allPredictionData);

    await this.renderPrediksiKeTable();

    //
    // Stock Chart
    //

    const stockFilter = document.getElementById("stocks-filter");
    const stockFilterWeek = document.getElementById("stocks-filter-week");
    const stockFilterMY = document.getElementById("stocks-filter-my");
    const stockFilterY = document.getElementById("stocks-filter-year");

    stockFilterMY.value = `${defaultYear}-${defaultMonth}`;
    stockFilterY.value = `${defaultYear}`;

    const stockMYValue = stockFilterMY.value;
    const MYsplited = stockMYValue.split("-").map(Number);
    const stockYear = MYsplited[0];
    // console.log("splity", stockYear);

    stockFilter.addEventListener("change", function () {
      const selectedValue = this.value; // Mendapatkan nilai yang dipilih

      // Pengondisian berdasarkan opsi yang dipilih
      switch (selectedValue) {
        case "daily":
          // Fungsi untuk opsi Harian
          console.log("Opsi yang dipilih: Harian");
          stockFilterWeek.style.display = "block";
          stockFilterMY.style.display = "block";
          stockFilterY.style.display = "none";

          stockFilterY.value = stockYear;

          break;
        case "weekly":
          // Fungsi untuk opsi Mingguan
          console.log("Opsi yang dipilih: Mingguan");
          stockFilterWeek.style.display = "none";
          stockFilterMY.style.display = "block";
          stockFilterY.style.display = "none";

          stockFilterY.value = stockYear;

          break;
        case "monthly":
          // Fungsi untuk opsi Bulanan
          console.log("Opsi yang dipilih: Bulanan");
          stockFilterWeek.style.display = "none";
          stockFilterMY.style.display = "none";
          stockFilterY.style.display = "block";
          // Tambahkan fungsi yang diinginkan di sini
          break;
        default:
          console.log("Opsi tidak dikenali");
      }
      // displayFinancialCharts();
    });

    const allStocksData = await RBPsource.getStocks();
    // console.log("allstoData", allStocksData);

    // Fungsi untuk memfilter data berdasarkan tahun, bulan, dan minggu untuk stock
    function filterStockData(
      filterType,
      data,
      targetYear,
      targetMonth,
      targetWeek
    ) {
      // Filter berdasarkan tahun dan bulan
      const filteredByYearAndMonth = data
        .filter((item) => {
          const itemDate = new Date(item.date);
          return (
            itemDate.getFullYear() === targetYear &&
            itemDate.getMonth() === targetMonth
          );
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Tambahkan sorting di sini

      const weeks = {};
      const months = {};

      filteredByYearAndMonth.forEach((item) => {
        const itemDate = new Date(item.date);
        const weekNumber = getWeekNumberInMonth(itemDate);
        const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

        if (!weeks[weekNumber]) {
          weeks[weekNumber] = [];
        }
        weeks[weekNumber].push(item);

        if (
          !months[monthKey] ||
          new Date(item.date) > new Date(months[monthKey].date)
        ) {
          months[monthKey] = item;
        }
      });

      if (filterType === "daily") {
        if (targetWeek === "semua") {
          // Pastikan setiap minggu juga diurutkan
          Object.keys(weeks).forEach((week) => {
            weeks[week] = weeks[week].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            );
          });
          return weeks;
        } else {
          return (weeks[targetWeek] || []).sort(
            (a, b) => new Date(a.date) - new Date(b.date)
          );
        }
      } else if (filterType === "weekly") {
        const weeklyData = Object.keys(weeks)
          .slice(-5)
          .map((week) => {
            const weekItems = weeks[week].sort(
              (a, b) => new Date(a.date) - new Date(b.date)
            );
            const aggregatedData = weekItems.reduce(
              (acc, current) => {
                acc.additional_stock += current.additional_stock;
                acc.sold_stock += current.sold_stock;
                acc.spoiled_stock += current.spoiled_stock;
                return acc;
              },
              {
                total_stock: 0,
                additional_stock: 0,
                sold_stock: 0,
                spoiled_stock: 0,
              }
            );

            return {
              week: week,
              date: weekItems[weekItems.length - 1].date, // Gunakan tanggal terakhir di minggu itu
              ...aggregatedData,
            };
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date)); // Urutkan weekly data

        return weeklyData;
      } else if (filterType === "monthly") {
        // Proses untuk data bulanan
        const monthlyData = [];
        const months = {};

        const selectedYear = parseInt(
          document.getElementById("stocks-filter-year").value,
          10
        );

        data.forEach((item) => {
          const itemDate = new Date(item.date);
          const itemYear = itemDate.getFullYear();
          const monthKey = `${itemYear}-${itemDate.getMonth()}`;

          if (itemYear === selectedYear) {
            if (!months[monthKey]) {
              months[monthKey] = {
                additional_stock: 0,
                sold_stock: 0,
                spoiled_stock: 0,
                latestDate: null,
              };
            }

            months[monthKey].additional_stock += item.additional_stock;
            months[monthKey].sold_stock += item.sold_stock;
            months[monthKey].spoiled_stock += item.spoiled_stock;

            // Simpan tanggal terbaru
            if (
              !months[monthKey].latestDate ||
              new Date(item.date) > new Date(months[monthKey].latestDate)
            ) {
              months[monthKey].latestDate = item.date;
            }
          }
        });

        Object.keys(months).forEach((monthKey) => {
          const [year, month] = monthKey.split("-").map(Number);
          const monthName = new Date(year, month).toLocaleString("default", {
            month: "long",
          });

          monthlyData.push({
            month: monthName,
            date: months[monthKey].latestDate,
            additional_stock: months[monthKey].additional_stock,
            sold_stock: months[monthKey].sold_stock,
            spoiled_stock: months[monthKey].spoiled_stock,
          });
        });

        // Urutkan berdasarkan bulan
        monthlyData.sort((a, b) => {
          const monthOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });

        return monthlyData;
      }
    }
    // Fungsi untuk menampilkan grafik stock
    let stockChart;
    async function displayStockCharts() {
      if (stockChart) {
        stockChart.destroy(); // Hancurkan chart yang ada
      }

      const selectedWeek = document.getElementById("stocks-filter-week").value;
      const selectedMonth = document.getElementById("stocks-filter-my").value;
      const [year, month] = selectedMonth.split("-").map(Number);
      const yearInputValue =
        document.getElementById("stocks-filter-year").value;

      const filterType = stockFilter.value; // Ambil jenis filter dari elemen UI
      const targetYear =
        filterType === "monthly" ? parseInt(yearInputValue, 10) : year;
      const targetMonth = month - 1; // Bulan dimulai dari 0
      const targetWeek = selectedWeek;

      // Filter data
      const filteredData = filterStockData(
        filterType,
        allStocksData,
        targetYear,
        targetMonth,
        targetWeek
      );
      // console.log("filtrdt", filteredData);

      // Siapkan data untuk Chart.js
      let alltotalStockData = [];
      let totalAdditionalStockData = [];
      let totalSoldStockData = [];
      let totalSpoiledStockData = [];
      let labels = [];

      if (targetWeek === "semua") {
        if (filterType === "daily") {
          for (const week in filteredData) {
            const weekData = filteredData[week];
            weekData.forEach((item) => {
              alltotalStockData.push(item.total_stock);
              totalAdditionalStockData.push(item.additional_stock);
              totalSoldStockData.push(item.sold_stock);
              totalSpoiledStockData.push(item.spoiled_stock);
              labels.push(item.date);
            });
          }
        } else if (filterType === "weekly") {
          filteredData.forEach((item) => {
            // console.log('itemst', item.additional_stock);
            totalAdditionalStockData.push(item.additional_stock);
            // console.log("totalAdditionalStockData", totalAdditionalStockData);
            totalSoldStockData.push(item.sold_stock);
            // console.log("totalSoldStockData", totalSoldStockData);
            totalSpoiledStockData.push(item.spoiled_stock);
            // console.log("totalSpoiledStockData", totalSpoiledStockData);
            // labels.push(item.date);
            labels.push(`Week ${item.week}`);
          });
        } else if (filterType === "monthly") {
          filteredData.forEach((item) => {
            totalAdditionalStockData.push(item.additional_stock);
            totalSoldStockData.push(item.sold_stock);
            totalSpoiledStockData.push(item.spoiled_stock);
            labels.push(item.month); // Gunakan item.month sebagai label
          });
        }
      } else {
        // Jika targetWeek bukan 'semua', ambil data dari minggu yang dipilih
        const weekData = filteredData || [];
        alltotalStockData = weekData.map((item) => item.total_stock);
        totalAdditionalStockData = weekData.map(
          (item) => item.additional_stock
        );
        totalSoldStockData = weekData.map((item) => item.sold_stock);
        totalSpoiledStockData = weekData.map((item) => item.spoiled_stock);
        labels = weekData.map((item) => item.date);
        console.log("ini jalan");
      }

      // Buat grafik dengan Chart.js
      // console.log("======================");
      // console.log("labels", labels);
      // console.log("totalAdditionalStockData", totalAdditionalStockData);
      // console.log("totalSoldStockData", totalSoldStockData);
      // console.log("totalSpoiledStockData", totalSpoiledStockData);
      callStockChart(
        labels,
        alltotalStockData,
        totalAdditionalStockData,
        totalSoldStockData,
        totalSpoiledStockData
      );
    }

    // Fungsi untuk memanggil grafik stock
    function callStockChart(
      labels,
      alltotalStockData,
      totalAdditionalStockData,
      totalSoldStockData,
      totalSpoiledStockData
    ) {
      // console.log("======================");
      // console.log("labels", labels);
      // console.log("totalAdditionalStockData", totalAdditionalStockData);
      // console.log("totalSoldStockData", totalSoldStockData);
      // console.log("totalSpoiledStockData", totalSpoiledStockData);
      const filterType = stockFilter.value;
      const ctx = document.getElementById("stockChartData").getContext("2d");
      stockChart = new Chart(ctx, {
        type: "line", // Jenis grafik
        data: {
          labels: labels,
          datasets: [
            ...(filterType === "daily"
              ? [
                  {
                    label: "Total Stock",
                    data: alltotalStockData,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                    fill: true,
                    hidden: true,
                  },
                ]
              : []), // Menyertakan dataset "Total Stock" jika filterType adalah "daily"
            {
              label: "Additional Stock",
              data: totalAdditionalStockData,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
            {
              label: "Sold Stock",
              data: totalSoldStockData,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
            },
            {
              label: "Spoiled Stock",
              data: totalSpoiledStockData,
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

    // Menambahkan event listener untuk filter stock
    stockFilter.addEventListener("change", async function () {
      stockFilterWeek.value = `semua`;
      await displayStockCharts();
    });

    // Menambahkan event listener untuk filter minggu
    stockFilterWeek.addEventListener("change", async function () {
      await displayStockCharts();
    });

    // Menambahkan event listener untuk filter bulan
    stockFilterMY.addEventListener("change", async function () {
      await displayStockCharts();
    });

    // Menambahkan event listener untuk filter tahun
    stockFilterY.addEventListener("change", async function () {
      await displayStockCharts();
    });

    // Panggil fungsi untuk menampilkan grafik stock saat halaman dimuat
    displayStockCharts();

    //
    // Financial Chart
    //

    const financeFilter = document.getElementById("finance-filter");
    const financeFilterWeek = document.getElementById("finance-filter-week");
    const financeFilterMY = document.getElementById("finance-filter-my");
    const financeFilterY = document.getElementById("finance-filter-year");

    financeFilterMY.value = `${defaultYear}-${defaultMonth}`;
    financeFilterY.value = `${defaultYear}`;

    const financeMYValue = financeFilterMY.value;
    const [year] = financeMYValue.split("-").map(Number);

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

          financeFilterY.value = year;

          break;
        case "weekly":
          // Fungsi untuk opsi Mingguan
          console.log("Opsi yang dipilih: Mingguan");
          financeFilterWeek.style.display = "none";
          financeFilterMY.style.display = "block";
          financeFilterY.style.display = "none";

          financeFilterY.value = year;

          break;
        case "monthly":
          // Fungsi untuk opsi Bulanan
          console.log("Opsi yang dipilih: Bulanan");
          financeFilterWeek.style.display = "none";
          financeFilterMY.style.display = "none";
          financeFilterY.style.display = "block";
          // Tambahkan fungsi yang diinginkan di sini
          break;
        default:
          console.log("Opsi tidak dikenali");
      }
      displayFinancialCharts();
    });

    //
    // Finance Chart Data Handler

    const allFinanceData = await RBPsource.getFinances();
    // console.log("alfidata", allFinanceData);

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

        // Ambil tahun yang dipilih dari financeFilterY
        const selectedYear = parseInt(
          document.getElementById("finance-filter-year").value,
          10
        ); // Pastikan untuk mendapatkan nilai tahun yang benar

        // Mengelompokkan data berdasarkan bulan
        data.forEach((item) => {
          const itemDate = new Date(item.date);

          // Ambil tahun dari itemDate
          const itemYear = itemDate.getFullYear();

          // Hanya proses data jika tahun item sama dengan tahun yang dipilih
          if (itemYear === selectedYear) {
            const monthKey = `${itemYear}-${itemDate.getMonth()}`; // Kunci untuk bulan

            // Simpan item terbaru untuk bulan ini
            if (
              !months[monthKey] ||
              new Date(item.date) > new Date(months[monthKey].date)
            ) {
              months[monthKey] = item;
            }
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

    let financialChart;
    async function displayFinancialCharts(yearInput) {
      if (financialChart) {
        financialChart.destroy(); // Hancurkan chart yang ada
      }

      const selectedWeek = document.getElementById("finance-filter-week").value;
      const selectedMonth = document.getElementById("finance-filter-my").value;
      const [year, month] = selectedMonth.split("-").map(Number); // Memisahkan tahun dan bulan
      const yearInputValue =
        yearInput || document.getElementById("finance-filter-year").value; // Gunakan yearInput jika ada

      // Value Master
      const filterType = financeFilter.value; // Ambil jenis filter dari elemen UI
      const targetYear =
        filterType === "monthly" ? parseInt(yearInputValue, 10) : year; // Gunakan yearInput jika monthly
      const targetMonth = month - 1; // Bulan dimulai dari 0
      const targetWeek = selectedWeek; // Ganti dengan nomor minggu (misal: 1, 2, 3, 4) atau 'semua'

      // console.log("yearValue", targetYear);

      // Filter data
      const filteredData = filterFinanceData(
        filterType,
        allFinanceData,
        targetYear,
        targetMonth,
        targetWeek
      );

      // console.log("Filtered Data:", filteredData);

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
      const ctx = document
        .getElementById("financialChartData")
        .getContext("2d");
      financialChart = new Chart(ctx, {
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
      financeFilterY.value = year;
    });

    // Menambahkan event listener untuk financeFilterMY
    financeFilterMY.addEventListener("change", async function () {
      const selectedMonthValue = this.value; // Mendapatkan nilai yang dipilih (format: YYYY-MM)
      const [year, month] = selectedMonthValue.split("-"); // Memisahkan tahun dan bulan
      console.log("Tahun yang dipilih:", year);
      console.log("Bulan yang dipilih:", month);
      await displayFinancialCharts();
      financeFilterY.value = year;
    });

    financeFilterY.addEventListener("change", async function () {
      const selectedYearValue = this.value; // Mendapatkan nilai yang dipilih (format: YYYY)
      const year = parseInt(selectedYearValue, 10); // Mengubah ke integer
      console.log("Tahun yang dipilih:", year);

      // Memastikan bahwa kita mengupdate targetYear di displayFinancialCharts
      const filterType = financeFilter.value; // Ambil jenis filter dari elemen UI
      if (filterType === "monthly") {
        // Update targetYear untuk monthly
        await displayFinancialCharts(year); // Kirim tahun yang dipilih
      } else {
        await displayFinancialCharts(); // Panggil tanpa parameter jika tidak monthly
      }
    });

    //
    // Cash Flow Chart
    //

    const cashFlowFilter = document.getElementById("cash-flow-filter");
    const cashFlowFilterWeek = document.getElementById("cash-flow-filter-week");
    const cashFlowFilterMY = document.getElementById("cash-flow-filter-my");
    const cashFlowFilterY = document.getElementById("cash-flow-filter-year");

    cashFlowFilterMY.value = `${defaultYear}-${defaultMonth}`;
    cashFlowFilterY.value = `${defaultYear}`;

    const allCashFlowData = await RBPsource.getFinances(); // Pastikan method ini tersedia di source

    // Fungsi untuk memfilter data arus kas
    function filterCashFlowData(
      filterType,
      data,
      targetYear,
      targetMonth,
      targetWeek
    ) {
      // Implementasi serupa dengan filterFinanceData
      const filteredByYearAndMonth = data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === targetYear &&
          itemDate.getMonth() === targetMonth
        );
      });

      const weeks = {};
      // const months = {};

      filteredByYearAndMonth.forEach((item) => {
        const itemDate = new Date(item.date);
        const weekNumber = getWeekNumberInMonth(itemDate);
        // const monthKey = `${itemDate.getFullYear()}-${itemDate.getMonth()}`;

        if (!weeks[weekNumber]) {
          weeks[weekNumber] = [];
        }
        weeks[weekNumber].push(item);
      });

      if (filterType === "daily") {
        return targetWeek === "semua" ? weeks : weeks[targetWeek] || [];
      } else if (filterType === "weekly") {
        const weeklyData = Object.keys(weeks)
          .slice(-5)
          .map((week) => {
            const weekItems = weeks[week];
            const aggregatedData = weekItems.reduce(
              (acc, current) => {
                acc.in_cash += current.in_cash;
                acc.in_debit += current.in_debit;
                acc.out_cash += current.out_cash;
                acc.out_debit += current.out_debit;
                acc.cash_to_debit += current.cash_to_debit;
                acc.debit_to_cash += current.debit_to_cash;
                return acc;
              },
              {
                in_cash: 0,
                in_debit: 0,
                out_cash: 0,
                out_debit: 0,
                cash_to_debit: 0,
                debit_to_cash: 0,
              }
            );

            return {
              week: week,
              ...aggregatedData,
            };
          });

        return weeklyData;
      } else if (filterType === "monthly") {
        const monthlyData = [];
        const months = {};

        const selectedYear = parseInt(
          document.getElementById("cash-flow-filter-year").value,
          10
        );

        data.forEach((item) => {
          const itemDate = new Date(item.date);
          const itemYear = itemDate.getFullYear();
          const monthKey = `${itemYear}-${itemDate.getMonth()}`;

          if (itemYear === selectedYear) {
            if (!months[monthKey]) {
              months[monthKey] = {
                in_cash: 0,
                in_debit: 0,
                out_cash: 0,
                out_debit: 0,
                cash_to_debit: 0,
                debit_to_cash: 0,
              };
            }

            months[monthKey].in_cash += item.in_cash;
            months[monthKey].in_debit += item.in_debit;
            months[monthKey].out_cash += item.out_cash;
            months[monthKey].out_debit += item.out_debit;
            months[monthKey].cash_to_debit += item.cash_to_debit;
            months[monthKey].debit_to_cash += item.debit_to_cash;
          }
        });

        Object.keys(months).forEach((monthKey) => {
          const [year, month] = monthKey.split("-").map(Number);
          const monthName = new Date(year, month).toLocaleString("default", {
            month: "long",
          });

          monthlyData.push({
            month: monthName,
            ...months[monthKey],
          });
        });

        monthlyData.sort((a, b) => {
          const monthOrder = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
        });

        return monthlyData;
      }
    }

    let cashFlowChart;
    async function displayCashFlowCharts() {
      if (cashFlowChart) {
        cashFlowChart.destroy();
      }

      const selectedWeek = document.getElementById(
        "cash-flow-filter-week"
      ).value;
      const selectedMonth = document.getElementById(
        "cash-flow-filter-my"
      ).value;
      const [year, month] = selectedMonth.split("-").map(Number);
      const yearInputValue = document.getElementById(
        "cash-flow-filter-year"
      ).value;

      const filterType = cashFlowFilter.value;
      const targetYear =
        filterType === "monthly" ? parseInt(yearInputValue, 10) : year;
      const targetMonth = month - 1;
      const targetWeek = selectedWeek;

      const filteredData = filterCashFlowData(
        filterType,
        allCashFlowData,
        targetYear,
        targetMonth,
        targetWeek
      );

      // console.log("Filtered Cash Flow Data:", filteredData);

      // Persiapan data untuk chart
      let inCashData = [];
      let inDebitData = [];
      let outCashData = [];
      let outDebitData = [];
      let cashToDebitData = [];
      let debitToCashData = [];
      let labels = [];

      // Logika untuk mengisi data
      if (targetWeek === "semua") {
        if (filterType === "daily") {
          for (const week in filteredData) {
            const weekData = filteredData[week];
            weekData.forEach((item) => {
              inCashData.push(item.in_cash);
              inDebitData.push(item.in_debit);
              outCashData.push(item.out_cash);
              outDebitData.push(item.out_debit);
              cashToDebitData.push(item.cash_to_debit);
              debitToCashData.push(item.debit_to_cash);
              labels.push(item.date);
            });
          }
        } else if (filterType === "weekly") {
          filteredData.forEach((item) => {
            inCashData.push(item.in_cash);
            inDebitData.push(item.in_debit);
            outCashData.push(item.out_cash);
            outDebitData.push(item.out_debit);
            cashToDebitData.push(item.cash_to_debit);
            debitToCashData.push(item.debit_to_cash);
            labels.push(`Week ${item.week}`);
          });
        } else if (filterType === "monthly") {
          filteredData.forEach((item) => {
            inCashData.push(item.in_cash);
            inDebitData.push(item.in_debit);
            outCashData.push(item.out_cash);
            outDebitData.push(item.out_debit);
            cashToDebitData.push(item.cash_to_debit);
            debitToCashData.push(item.debit_to_cash);
            labels.push(item.month);
          });
        }
      } else {
        // Jika targetWeek bukan 'semua', ambil data dari minggu yang dipilih
        const weekData = filteredData || [];
        inCashData = weekData.map((item) => item.in_cash);
        inDebitData = weekData.map((item) => item.in_debit);
        outCashData = weekData.map((item) => item.out_cash);
        outDebitData = weekData.map((item) => item.out_debit);
        cashToDebitData = weekData.map((item) => item.cash_to_debit);
        debitToCashData = weekData.map((item) => item.debit_to_cash);
        labels = weekData.map((item) => item.date);
      }

      // Log data untuk debugging
      // console.log("Labels:", labels);
      // console.log("In Cash Data:", inCashData);
      // console.log("In Debit Data:", inDebitData);
      // console.log("Out Cash Data:", outCashData);
      // console.log("Out Debit Data:", outDebitData);
      // console.log("Cash to Debit Data:", cashToDebitData);
      // console.log("Debit to Cash Data:", debitToCashData);

      // Panggil fungsi untuk membuat chart
      callCashFlowChart(
        labels,
        inCashData,
        inDebitData,
        outCashData,
        outDebitData,
        cashToDebitData,
        debitToCashData
      );
    }

    function callCashFlowChart(
      labels,
      inCashData,
      inDebitData,
      outCashData,
      outDebitData,
      cashToDebitData,
      debitToCashData
    ) {
      const ctx = document.getElementById("cashFlowChartData").getContext("2d");
      cashFlowChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Pemasukan Cash",
              data: inCashData,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
            {
              label: "Pemasukan Debit",
              data: inDebitData,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              fill: true,
            },
            {
              label: "Pengeluaran Cash",
              data: outCashData,
              borderColor: "rgba(255, 206, 86, 1)",
              backgroundColor: "rgba(255, 206, 86, 0.2)",
              fill: true,
            },
            {
              label: "Pengeluaran Debit",
              data: outDebitData,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
            },
            {
              label: "Cash to Debit",
              data: cashToDebitData,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              fill: true,
            },
            {
              label: "Debit to Cash",
              data: debitToCashData,
              borderColor: "rgba(255, 159, 64, 1)",
              backgroundColor: "rgba(255, 159, 64, 0.2)",
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

    window.addEventListener("resize", function () {
      if (stockChart) stockChart.resize();
      if (financialChart) financialChart.resize();
      if (cashFlowChart) cashFlowChart.resize();
    });

    // Event listeners untuk filter
    cashFlowFilter.addEventListener("change", function () {
      const selectedValue = this.value;
      cashFlowFilterWeek.value = `semua`;

      switch (selectedValue) {
        case "daily":
          cashFlowFilterWeek.style.display = "block";
          cashFlowFilterMY.style.display = "block";
          cashFlowFilterY.style.display = "none";
          cashFlowFilterY.value = year;
          break;
        case "weekly":
          cashFlowFilterWeek.style.display = "none";
          cashFlowFilterMY.style.display = "block";
          cashFlowFilterY.style.display = "none";
          cashFlowFilterY.value = year;
          break;
        case "monthly":
          cashFlowFilterWeek.style.display = "none";
          cashFlowFilterMY.style.display = "none";
          cashFlowFilterY.style.display = "block";
          break;
      }
      displayCashFlowCharts();
    });

    cashFlowFilterWeek.addEventListener("change", async function () {
      await displayCashFlowCharts();
    });

    cashFlowFilterMY.addEventListener("change", async function () {
      const [selectedYear] = this.value.split("-");
      await displayCashFlowCharts();
      cashFlowFilterY.value = selectedYear;
    });

    cashFlowFilterY.addEventListener("change", async function () {
      const selectedYearValue = this.value;
      const year = parseInt(selectedYearValue, 10);
      const filterType = cashFlowFilter.value;

      if (filterType === "monthly") {
        await displayCashFlowCharts(year);
      } else {
        await displayCashFlowCharts();
      }
    });

    // Panggil saat halaman pertama kali dimuat
    displayCashFlowCharts();

    //
    // displayer
    //

    const totalCashValue = document.getElementById("total-cash");
    const totalProfitValue = document.getElementById("total-profit");
    const totalSoldValue = document.getElementById("sold-stocks");
    const totalSpoiledValue = document.getElementById("spoiled-stocks");

    const currDate = getCurrentDate().pickedDate;
    const yesterdayDate = getYesterdayDate().yesterday;
    // console.log("currdate", currDate);
    // console.log("ystdd", yesterdayDate);

    function profitShowHideHandler(idToHide, idToShow) {
      idToHide.style.display = "none";
      idToShow.style.display = "unset";
    }

    function persentaseSelisih(dataBaru, dataSebelumnya) {
      // Validasi input
      if (dataBaru === undefined || dataSebelumnya === undefined) {
        console.log("Error: Data tidak lengkap");
        return {
          hasilSelisih: null,
          pesan: "Data tidak lengkap",
        };
      }

      // Konversi ke tipe numerik jika diperlukan
      dataBaru = Number(dataBaru);
      dataSebelumnya = Number(dataSebelumnya);

      // Cek apakah input valid numerik
      if (isNaN(dataBaru) || isNaN(dataSebelumnya)) {
        console.log("Error: Input harus berupa angka");
        return {
          hasilSelisih: null,
          pesan: "Input harus berupa angka",
        };
      }

      // Penanganan kasus pembagi nol
      if (dataSebelumnya === 0) {
        // Jika data sebelumnya 0, tapi data baru tidak 0
        if (dataBaru !== 0) {
          // console.log("Pertumbuhan 100%");
          return {
            hasilSelisih: "100.00",
            pesan: "Pertumbuhan 100%",
          };
        }

        // Jika keduanya 0
        return {
          hasilSelisih: "0.00",
          pesan: "Tidak ada perubahan",
        };
      }

      // Hitung selisih dan persentase
      const hitungSelisih = dataBaru - dataSebelumnya;
      // console.log("HITUNGSELISIH", hitungSelisih);

      // Perhitungan persentase selisih berdasarkan data sebelumnya
      const prosesSelisih = (hitungSelisih / dataSebelumnya) * 100;

      // Pembulatan dengan 2 desimal
      const hasilSelisih = prosesSelisih.toFixed(2);

      // console.log("Data Baru:", dataBaru);
      // console.log("Data Sebelumnya:", dataSebelumnya);
      // console.log("Selisih:", hitungSelisih);
      // console.log("Persentase Selisih:", hasilSelisih);

      return {
        hasilSelisih: hasilSelisih,
        pesan: "Berhasil menghitung persentase selisih",
      };
    }

    //
    // Financsial Cashes
    const cashValue = document.getElementById("cash");
    const debitValue = document.getElementById("debit");

    const { totalCash, totalDebit } = await allFinanceDataByDate(currDate);

    const totalCashY = (await allFinanceDataByDate(yesterdayDate)).totalCash;
    const totalDebitY = (await allFinanceDataByDate(yesterdayDate)).totalDebit;

    const totalFinance = totalCash + totalDebit;
    const totalFinanceY = totalCashY + totalDebitY;
    const selisihFinanceD = persentaseSelisih(
      totalFinance,
      totalFinanceY
    ).hasilSelisih;

    totalCashValue.textContent = `Rp. ${totalFinance.toLocaleString("ID")}`;
    cashValue.textContent = `Cash : Rp. ${totalCash.toLocaleString("ID")}`;
    debitValue.textContent = `Kredit : Rp. ${totalDebit.toLocaleString("ID")}`;

    const todayCashStatusArrUp = document.querySelector(
      "#todayCashStatus #arrUp"
    );
    const todayCashStatusArrUpArrDown = document.querySelector(
      "#todayCashStatus #arrDown"
    );
    const todayCashStatusArrUpText = document.querySelector(
      "#todayCashStatus #arrUp span"
    );
    const todayCashStatusArrDownText = document.querySelector(
      "#todayCashStatus #arrDown span"
    );

    if (selisihFinanceD > 0) {
      profitShowHideHandler(todayCashStatusArrUpArrDown, todayCashStatusArrUp);
      todayCashStatusArrUpText.textContent = selisihFinanceD;
    } else {
      profitShowHideHandler(todayCashStatusArrUp, todayCashStatusArrUpArrDown);
      todayCashStatusArrDownText.textContent = selisihFinanceD;
    }

    //
    // weekly monthly
    async function updateCashStatus(allCashFlowData) {
      const currDate = getCurrentDate().pickedDate; // Ambil tanggal hari ini
      const today = new Date(currDate);

      // Hitung tanggal untuk minggu lalu (7 hari yang lalu)
      const lastWeekDate = new Date(today);
      lastWeekDate.setDate(today.getDate() - 7); // 7 hari yang lalu
      // console.log("lastWeekDate", lastWeekDate);

      // Hitung tanggal untuk bulan lalu (tanggal terakhir bulan lalu)
      const lastMonthDate = new Date(today.getFullYear(), today.getMonth(), 0); // Akhir bulan lalu
      // console.log("lastmodate", lastMonthDate);

      // Filter data untuk minggu lalu
      const lastWeekData = allCashFlowData.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate.toDateString() === lastWeekDate.toDateString(); // Ambil data tepat pada tanggal minggu lalu
      });
      // console.log("lastweekdata", lastWeekData);

      // Filter data untuk bulan lalu
      const lastMonthData = allCashFlowData.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === lastMonthDate.getFullYear() &&
          itemDate.getMonth() === lastMonthDate.getMonth() &&
          itemDate.getDate() === lastMonthDate.getDate()
        ); // Ambil data tepat pada tanggal terakhir bulan lalu
      });
      // console.log("lastmonthdata", lastMonthData);

      // Hitung total untuk hari ini
      const totalTodayCombined = totalFinance;
      // console.log("totalTodayCombined", totalTodayCombined);

      // Hitung total untuk minggu lalu
      const totalLastWeekCombined = lastWeekData.reduce((acc, item) => {
        return acc + item.total_cash + item.total_debit; // Jumlahkan total_cash dan total_debit
      }, 0);
      // console.log("totalLastWeekCombined", totalLastWeekCombined);

      // Hitung total untuk bulan lalu
      const totalLastMonthCombined = lastMonthData.reduce((acc, item) => {
        return acc + item.total_cash + item.total_debit; // Jumlahkan total_cash dan total_debit
      }, 0);
      // console.log("totalLastMonthCombined", totalLastMonthCombined);

      // Hitung persentase selisih untuk minggu lalu
      const percentageChangeWeek = persentaseSelisih(
        totalTodayCombined,
        totalLastWeekCombined
      ).hasilSelisih;
      // console.log("percentageChangeWeek", percentageChangeWeek);

      // Hitung persentase selisih untuk bulan lalu
      const percentageChangeMonth = persentaseSelisih(
        totalTodayCombined,
        totalLastMonthCombined
      ).hasilSelisih;
      // console.log("percentageChangeMonth", percentageChangeMonth);

      // Update tampilan untuk minggu lalu
      const weekCashStatusArrUp = document.querySelector(
        "#tweekCashStatus #arrUp"
      );
      const weekCashStatusArrDown = document.querySelector(
        "#tweekCashStatus #arrDown"
      );
      const weekCashStatusArrUpText = document.querySelector(
        "#tweekCashStatus #arrUp span"
      );
      const weekCashStatusArrDownText = document.querySelector(
        "#tweekCashStatus #arrDown span"
      );

      if (percentageChangeWeek > 0) {
        profitShowHideHandler(weekCashStatusArrDown, weekCashStatusArrUp);
        weekCashStatusArrUpText.textContent = percentageChangeWeek;
      } else {
        profitShowHideHandler(weekCashStatusArrUp, weekCashStatusArrDown);
        weekCashStatusArrDownText.textContent = percentageChangeWeek;
      }

      // Update tampilan untuk bulan lalu
      const monthCashStatusArrUp = document.querySelector(
        "#tmonthCashStatus #arrUp"
      );
      const monthCashStatusArrDown = document.querySelector(
        "#tmonthCashStatus #arrDown"
      );
      const monthCashStatusArrUpText = document.querySelector(
        "#tmonthCashStatus #arrUp span"
      );
      const monthCashStatusArrDownText = document.querySelector(
        "#tmonthCashStatus #arrDown span"
      );

      if (percentageChangeMonth > 0) {
        profitShowHideHandler(monthCashStatusArrDown, monthCashStatusArrUp);
        monthCashStatusArrUpText.textContent = percentageChangeMonth;
      } else {
        profitShowHideHandler(monthCashStatusArrUp, monthCashStatusArrDown);
        monthCashStatusArrDownText.textContent = percentageChangeMonth;
      }
    }

    // Panggil fungsi ini setelah data cash flow diambil
    updateCashStatus(allCashFlowData);

    //
    // Financial Profits

    // CURRENT MONTH FINANCIAL DATA
    const currMonthData = await allFinanceDataThisMonth(
      defaultMonth,
      defaultYear
    );
    const currTotalIn = currMonthData.totalInCash + currMonthData.totalInDebit;
    const currTotalOut =
      currMonthData.totalOutCash + currMonthData.totalOutDebit;
    const currMonthProfit = currTotalIn - currTotalOut;

    // PREVIOUS MONTH DATA
    const prevMonthData = await allFinanceDataThisMonth(
      defaultMonth - 1,
      defaultYear
    );
    const prevTotalIn = prevMonthData.totalInCash + prevMonthData.totalInDebit;
    const prevTotalOut =
      prevMonthData.totalOutCash + prevMonthData.totalOutDebit;
    const prevMonthProfit = prevTotalIn - prevTotalOut;

    // SHOW PROFITs
    totalProfitValue.textContent = `Rp. ${currMonthProfit.toLocaleString(
      "ID"
    )}`;

    const currIncomeText = document.getElementById("currIncome");
    currIncomeText.textContent = `In : Rp. ${currTotalIn.toLocaleString("ID")}`;
    const currExpenseText = document.getElementById("currExpense");
    currExpenseText.textContent = `Out : Rp. ${currTotalOut.toLocaleString(
      "ID"
    )}`;

    const prevIncomeText = document.getElementById("prevIncome");
    prevIncomeText.textContent = `In : Rp. ${prevTotalIn.toLocaleString("ID")}`;
    const prevExpenseText = document.getElementById("prevExpense");
    prevExpenseText.textContent = `Out : Rp. ${prevTotalOut.toLocaleString(
      "ID"
    )}
    `;
    // PERCENTAGE HANDLER
    const percentageChangeProfit = persentaseSelisih(
      currMonthProfit,
      prevMonthProfit
    ).hasilSelisih;

    const todayProfitStatusArrUp = document.querySelector(
      "#todayProfitStatus #arrUp"
    );
    const todayProfitStatusArrDown = document.querySelector(
      "#todayProfitStatus #arrDown"
    );
    const todayProfitStatusArrUpText = document.querySelector(
      "#todayProfitStatus #arrUp span"
    );
    const todayProfitStatusArrDownText = document.querySelector(
      "#todayProfitStatus #arrDown span"
    );

    if (percentageChangeProfit > 0) {
      profitShowHideHandler(todayProfitStatusArrDown, todayProfitStatusArrUp);
      todayProfitStatusArrUpText.textContent = percentageChangeProfit;
    } else {
      profitShowHideHandler(todayProfitStatusArrUp, todayProfitStatusArrDown);
      todayProfitStatusArrDownText.textContent = percentageChangeProfit;
    }

    //
    // STOCKS CONTROL

    // CURRENT MONTH STOCK DATA
    const currMonthStockData = await allStockDataThisMonth(
      defaultMonth,
      defaultYear
    );

    const currSoldStockData = currMonthStockData.totalSoldStock;
    const currSpoiledStockData = currMonthStockData.totalSpoiledStock;
    // console.log("currSSD", currSoldStockData, currSpoiledStockData);

    // PREVIOUS MONTH STOCK DATA
    const prevMonthStockData = await allStockDataThisMonth(
      defaultMonth - 1,
      defaultYear
    );

    const prevSoldStockData = prevMonthStockData.totalSoldStock;
    const prevSpoiledStockData = prevMonthStockData.totalSpoiledStock;
    // console.log("prevSSD", prevSoldStockData, prevSpoiledStockData);

    // DISPLAY STOCK DATA
    totalSoldValue.textContent = `${currSoldStockData} terjual`;
    totalSpoiledValue.textContent = `${currSpoiledStockData} rusak`;

    // SOLD STOCKS PERCENTAGE HANDLER
    const stockPercentageChangeSold = persentaseSelisih(
      currSoldStockData,
      prevSoldStockData
    ).hasilSelisih;

    const todaySoldStockStatusArrUp = document.querySelector(
      "#soldStockStatus #arrUp"
    );
    const todaySoldStockStatusArrDown = document.querySelector(
      "#soldStockStatus #arrDown"
    );
    const todaySoldStockStatusArrUpText = document.querySelector(
      "#soldStockStatus #arrUp span"
    );
    const todaySoldStockStatusArrDownText = document.querySelector(
      "#soldStockStatus #arrDown span"
    );

    if (stockPercentageChangeSold > 0) {
      profitShowHideHandler(
        todaySoldStockStatusArrDown,
        todaySoldStockStatusArrUp
      );
      todaySoldStockStatusArrUpText.textContent = stockPercentageChangeSold;
    } else {
      profitShowHideHandler(
        todaySoldStockStatusArrUp,
        todaySoldStockStatusArrDown
      );
      todaySoldStockStatusArrDownText.textContent = stockPercentageChangeSold;
    }

    // SPOILED STOCKS PERCENTAGE HANDLER
    const stockPercentageChangeSpoiled = persentaseSelisih(
      currSpoiledStockData,
      prevSpoiledStockData
    ).hasilSelisih;

    const todaySpoiledtockStatusArrUp = document.querySelector(
      "#spoiledStockStatus #arrUp"
    );
    const todaySpoiledtockStatusArrDown = document.querySelector(
      "#spoiledStockStatus #arrDown"
    );
    const todaySpoiledtockStatusArrUpText = document.querySelector(
      "#spoiledStockStatus #arrUp span"
    );
    const todaySpoiledtockStatusArrDownText = document.querySelector(
      "#spoiledStockStatus #arrDown span"
    );

    if (stockPercentageChangeSpoiled > 0) {
      profitShowHideHandler(
        todaySpoiledtockStatusArrUp,
        todaySpoiledtockStatusArrDown
      );
      todaySpoiledtockStatusArrDownText.textContent = `+${Math.abs(
        stockPercentageChangeSpoiled
      )}`;
    } else {
      profitShowHideHandler(
        todaySpoiledtockStatusArrDown,
        todaySpoiledtockStatusArrUp
      );
      todaySpoiledtockStatusArrUpText.textContent = Math.abs(
        stockPercentageChangeSpoiled
      );
    }
  },

  async displayPredictionChart(predictionData) {
    // Hitung total data
    const totalData = predictionData.length;

    // Hitung jumlah untuk setiap kategori
    const akuratTrue = predictionData.filter(
      (item) => item.akurat === true
    ).length;
    const akuratFalse = predictionData.filter(
      (item) => item.akurat === false
    ).length;
    const akuratNull = predictionData.filter(
      (item) => item.akurat === null
    ).length;

    // Hitung persentase
    const persenAkuratTrue = ((akuratTrue / totalData) * 100).toFixed(2);
    const persenAkuratFalse = ((akuratFalse / totalData) * 100).toFixed(2);
    const persenAkuratNull = ((akuratNull / totalData) * 100).toFixed(2);

    // Buat chart
    const ctx = document.getElementById("predictionAccuracy").getContext("2d");
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: [
          `Akurat (${persenAkuratTrue}%)`,
          `Tidak Akurat (${persenAkuratFalse}%)`,
          `Belum Diverifikasi (${persenAkuratNull}%)`,
        ],
        datasets: [
          {
            data: [akuratTrue, akuratFalse, akuratNull],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)", // Hijau untuk akurat
              "rgba(255, 99, 132, 0.6)", // Merah untuk tidak akurat
              "rgba(54, 162, 235, 0.6)", // Biru untuk belum diverifikasi
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Keseluruhan (Operasional Aktif)",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const currentValue = context.parsed;
                const percentage = ((currentValue / total) * 100).toFixed(2);
                return `${context.label}: ${currentValue} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  },

  // Fungsi untuk menghitung akurasi prediksi
  async hitungAkurasiPrediksi(dataPrediksi, databasePrediksi) {
    // Filter data prediksi yang sesuai dengan kriteria
    const prediksiSesuai = databasePrediksi.filter(
      (item) =>
        item.weekend === dataPrediksi.weekend &&
        item.libur === dataPrediksi.libur &&
        item.cuaca === dataPrediksi.cuaca &&
        item.event_raya === dataPrediksi.event_raya
    );
    // console.log("prediksiSesuai", prediksiSesuai);

    // Hitung total prediksi sesuai
    const totalPrediksiSesuai = prediksiSesuai.length;
    console.log("totalPrediksiSesuai", totalPrediksiSesuai);

    // Hitung prediksi yang akurat
    const prediksiAkurat = prediksiSesuai.filter(
      (item) => item.akurat === true
    ).length;
    const prediksiAkuratFalse = prediksiSesuai.filter(
      (item) => item.akurat === false
    ).length;
    const prediksiAkuratNull = prediksiSesuai.filter(
      (item) => item.akurat === null
    ).length;

    console.log("prediksiAkurat", prediksiAkurat);

    // Hitung persentase akurasi
    const persentaseAkurasi =
      totalPrediksiSesuai > 0
        ? ((prediksiAkurat / totalPrediksiSesuai) * 100).toFixed(2)
        : 0;

    return {
      totalPrediksi: totalPrediksiSesuai,
      prediksiAkurat: prediksiAkurat,
      persentaseAkurasi: `${persentaseAkurasi}%`,
      prediksiAkuratNull: prediksiAkuratNull,
      prediksiAkuratFalse: prediksiAkuratFalse
    };
  },

  // Render ke dalam tabel
  async renderPrediksiKeTable() {
    const dataPrediksiHariIni = (
      await allPredictionDataByDate(getCurrentDate().pickedDate)
    ).filteredData;
    const dataPrediksiHariIniFilter = {
      weekend: dataPrediksiHariIni.weekend,
      libur: dataPrediksiHariIni.libur,
      cuaca: dataPrediksiHariIni.cuaca,
      event_raya: dataPrediksiHariIni.event_raya,
    };
    console.log("Data Prediksi Hari Ini: ", dataPrediksiHariIniFilter);

    const dataPrediksiBesok = (
      await allPredictionDataByDate(getTomorrowDate().tomorrowDate)
    ).filteredData;
    const dataPrediksiBesokFilter = {
      weekend: dataPrediksiBesok.weekend,
      libur: dataPrediksiBesok.libur,
      cuaca: dataPrediksiBesok.cuaca,
      event_raya: dataPrediksiBesok.event_raya,
    };
    console.log("Data Prediksi besok: ", dataPrediksiBesokFilter);

    // Contoh database prediksi (seharusnya diambil dari backend/database)
    const databasePrediksi = (await RBPsource.getPredictions()).filter(
      (item) => item.operasional === true
    );
    // console.log("databasePrediksi", databasePrediksi);

    // Hitung akurasi untuk hari ini dan besok
    const akurasiHariIni = await this.hitungAkurasiPrediksi(
      dataPrediksiHariIniFilter,
      databasePrediksi,
      
    );
    const akurasiBesok = await this.hitungAkurasiPrediksi(
      dataPrediksiBesokFilter,
      databasePrediksi
    );

    // Ambil elemen tabel
    const tabelPrediksi = document.querySelector(".predictionsDataTable");

    // Bersihkan isi tabel sebelumnya
    tabelPrediksi.innerHTML = `
        <tr>
            <td>Hari ini</td>
            <td>:</td>
            <td>${dataPrediksiHariIni.hasil_prediksi}</td>
            <td></td>
            <td>akurasi :</td>
            <td>${akurasiHariIni.persentaseAkurasi}
            <div class="tooltip">
              <span class="tooltiptext">
                <p id="predTooltip">${akurasiHariIni.prediksiAkurat} / ${akurasiHariIni.totalPrediksi} Data prediksi</p>
                <p id="predTooltip">N: ${akurasiHariIni.prediksiAkuratNull}, F: ${akurasiHariIni.prediksiAkuratFalse}, T: ${akurasiHariIni.prediksiAkurat}</p>
              </span>
              <i class="fas fa-circle-info"></i>
            </div>
            </td>
        </tr>
        <tr>
            <td>Besok</td>
            <td>:</td>
            <td>${dataPrediksiBesok.hasil_prediksi}</td>
            <td></td>
            <td>akurasi :</td>
            <td>${akurasiBesok.persentaseAkurasi}
            <div class="tooltip">
              <span class="tooltiptext">
                <p id="predTooltip">${akurasiBesok.prediksiAkurat} / ${akurasiBesok.totalPrediksi} Data prediksi</p>
                <p id="predTooltip">N: ${akurasiBesok.prediksiAkuratNull}, F: ${akurasiBesok.prediksiAkuratFalse}, T: ${akurasiBesok.prediksiAkurat}</p>
              </span>
              <i class="fas fa-circle-info"></i>
            </div>
            </td>
        </tr>
    `;
  },
};

export default Home;
