
import RBPsource, { bacaHariLibur, getHolidays } from "../../../data/source";

const Home = {
  async render() {
    return `
      <div class="content">
        <h2 class="content__heading">Data Stok</h2>
        <div id="stock-table-container"></div>
      </div>
    `;
  },

  async afterRender() {

    // await getHolidays()
    // await bacaHariLibur()
    
    try {
      // Ambil data stok
      let stockData = await RBPsource.getStocks();

      // Urutkan data berdasarkan tanggal (terbaru ke terlama)
      stockData = stockData.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      // Buat struktur tabel
      const tableHTML = `
        <div class="table-container">
          <table class="stock-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Stok Awal</th>
                <th>Stok Tambahan</th>
                <th>Stok Bonus</th>
                <th>Stok Rusak</th>
                <th>Stok Terjual</th>
                <th>Total Stok</th>
                <th>Sisa Stok</th>
              </tr>
            </thead>
            <tbody>
              ${stockData
                .map(
                  (stock) => `
                <tr>
                  <td>${new Date(stock.date).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</td>
                  <td>${stock.initial_stock}</td>
                  <td>${stock.additional_stock}</td>
                  <td>${stock.bonus_stock}</td>
                  <td>${stock.spoiled_stock}</td>
                  <td>${stock.sold_stock}</td>
                  <td>${stock.total_stock}</td>
                  <td>${stock.remaining_stock}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      // Tambahkan styles
      const styles = `
        <style>
        
          .table-container {
            margin: 20px;
            overflow-x: auto;
          }

          .stock-table {
            width: 77%;
            border-collapse: collapse;
            background-color: #ffffff;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }

          .stock-table th,
          .stock-table td {
            padding: 12px;
            text-align: center;
            border: 1px solid #ddd;
          }

          .stock-table th {
            background-color: #f4f4f4;
            font-weight: bold;
          }

          .stock-table tr:nth-child(even) {
            background-color: #f8f8f8;
          }

          .stock-table tr:hover {
            background-color: #f0f0f0;
          }

          .content__heading {
            width: 80%;
            margin: 20px;
            color: #333;
          }

          @media screen and (max-width: 768px) {
            .table-container {
              margin: 10px;
            }

            .stock-table th,
            .stock-table td {
              padding: 8px;
              font-size: 14px;
            }
          }
        </style>
      `;

      // Tambahkan styles ke head jika belum ada
      if (!document.querySelector("#stock-table-styles")) {
        const styleElement = document.createElement("style");
        styleElement.id = "stock-table-styles";
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
      }

      // Masukkan tabel ke dalam container
      const container = document.querySelector("#stock-table-container");
      container.innerHTML = tableHTML;
    } catch (error) {
      console.error("Error loading stock data:", error);
      const container = document.querySelector("#stock-table-container");
      container.innerHTML = `
        <div style="
          color: #721c24;
          background-color: #f8d7da;
          padding: 12px;
          margin: 10px;
          border-radius: 4px;
          text-align: center;
        ">
          Gagal memuat data stok
        </div>
      `;
    }
  },
};

export default Home;
