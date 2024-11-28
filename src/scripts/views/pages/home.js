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
    const defaultYear = getCurrentDate().year;
    const defaultMonth = getCurrentDate().month;

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
    console.log("splity", stockYear);

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
    console.log("allstoData", allStocksData);

    // Fungsi untuk memfilter data berdasarkan tahun, bulan, dan minggu untuk stock
    function filterStockData(
      filterType,
      data,
      targetYear,
      targetMonth,
      targetWeek
    ) {
      const filteredByYearAndMonth = data.filter((item) => {
        const itemDate = new Date(item.date);
        return (
          itemDate.getFullYear() === targetYear &&
          itemDate.getMonth() === targetMonth
        );
      });

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
          return weeks;
        } else {
          return weeks[targetWeek] || [];
        }
      } else if (filterType === "weekly") {
        const weeklyData = Object.keys(weeks)
          .slice(-5)
          .map((week) => {
            const weekItems = weeks[week];
            const aggregatedData = weekItems.reduce(
              (acc, current) => {
                acc.additional_stock += current.additional_stock;
                acc.sold_stock += current.sold_stock;
                acc.spoiled_stock += current.spoiled_stock;
                return acc;
              },
              {
                additional_stock: 0,
                sold_stock: 0,
                spoiled_stock: 0,
              }
            );

            // Tambahkan properti week untuk pelabelan
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
              };
            }

            months[monthKey].additional_stock += item.additional_stock;
            months[monthKey].sold_stock += item.sold_stock;
            months[monthKey].spoiled_stock += item.spoiled_stock;
          }
        });

        // Konversi objek bulan menjadi array dengan menambahkan label bulan
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
      console.log("filtrdt", filteredData);

      // Siapkan data untuk Chart.js
      let totalAdditionalStockData = [];
      let totalSoldStockData = [];
      let totalSpoiledStockData = [];
      let labels = [];

      if (targetWeek === "semua") {
        if (filterType === "daily") {
          for (const week in filteredData) {
            const weekData = filteredData[week];
            weekData.forEach((item) => {
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
        totalAdditionalStockData,
        totalSoldStockData,
        totalSpoiledStockData
      );
    }

    // Fungsi untuk memanggil grafik stock
    function callStockChart(
      labels,
      totalAdditionalStockData,
      totalSoldStockData,
      totalSpoiledStockData
    ) {
      console.log("======================");
      console.log("labels", labels);
      console.log("totalAdditionalStockData", totalAdditionalStockData);
      console.log("totalSoldStockData", totalSoldStockData);
      console.log("totalSpoiledStockData", totalSpoiledStockData);
      const ctx = document.getElementById("stockChartData").getContext("2d");
      stockChart = new Chart(ctx, {
        type: "line", // Jenis grafik
        data: {
          labels: labels,
          datasets: [
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
      stockFilterWeek.value = `semua`
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

      console.log("yearValue", targetYear);

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
  },
};

export default Home;
