import { createSalesTemplate } from "../template/template-creator";
import SalesSource from "../../../data/salesSource";
import TableHandler from "../../utils/table-handler"; // pastikan impor TableHandler
import {
  bagIcon,
  soldIcon,
  weatherIcon,
  tomorrowWeatherIcon,
  weekendIcon,
  eventIcon,
  homeIcon,
  activityIcon,
  walletIcon,
} from "../../utils/icons";

const Sales = {
  async render() {
    return `
      <div class="content">
        <div id="sales-content">
          ${createSalesTemplate()}
        </div>
      </div>
    `;
  },

  async afterRender() {
    document.getElementById("imgPredict").src = bagIcon;
    document.querySelector('img[alt="soldIcon"]').src = soldIcon;
    document.querySelector('img[alt="weatherIcon"]').src = weatherIcon;
    document.querySelector('img[alt="tomorowWeatherIcon"]').src =
      tomorrowWeatherIcon;
    document.querySelector('img[alt="weekendIcon"]').src = weekendIcon;
    document.querySelector('img[alt="eventIcon"]').src = eventIcon;
    document.querySelector('.container-item img[alt="Beranda Icon"]').src =
      homeIcon;
    document.querySelector('.container-item img[alt="Penjualan Icon"]').src =
      activityIcon;
    document.querySelector('.container-item img[alt="Keuangan Icon"]').src =
      walletIcon;

    const salesData = await SalesSource.fetchSalesData();

    // Panggil langsung dari TableHandler, bukan this
    TableHandler.populateSalesTable(salesData);

    const form = document.querySelector(".purchase-form form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const harga = document.querySelector("#tipe").value;
      const jumlah = document.querySelector("#quantity").value;
      const lokasi = document.querySelector("#purchase-type-select").value;

      const now = new Date();
      const date = now.toLocaleDateString("id-ID");
      const time = now.toLocaleTimeString("id-ID");
      const day = now.toLocaleDateString("id-ID", { weekday: "long" });

      const generateID = () => {
        const year = String(now.getFullYear()).slice(2);
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        const second = String(now.getSeconds()).padStart(2, "0");
        return `${year}${month}${day}${hour}${minute}${second}`;
      };

      const id = generateID();

      const saleData = {
        id: id,
        price: harga,
        quantity: jumlah,
        place: lokasi,
        date: date,
        time: time,
        day: day,
      };

      try {
        const result = await SalesSource.saveSaleData(saleData);
        // Panggil langsung dari TableHandler
        TableHandler.populateSalesTable([result]);
      } catch (error) {
        console.error("Error saving sale data:", error);
      }
    });
  },
};

export default Sales;
