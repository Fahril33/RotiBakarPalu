import UrlParser from "../routes/url-parser";
import routes from "../routes/routes";
import { getCurrentDate } from "../utils/datePicker";
import { allPredictionDataByDate } from "../../data/allData";
import { putPredictionData } from "../../data/utils/predictionHandler";
import { urlOtorizator } from "../utils/interceptor";
import RBPsource from "../../data/source";
import { create404Page } from "./template/template-creator";
import "../../styles/404page.css";
import { RBPlogo } from "../utils/icons";

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    await urlOtorizator();
    const url = UrlParser.parseActiveUrlWithCombiner();
    const token = localStorage.getItem("token");

    // Cek apakah halaman memerlukan autentikasi
    const authRequiredPages = ["/", "/home", "/sales", "/finance"];

    // Logika redirect untuk logout
    if (!token && authRequiredPages.includes(url)) {
      window.location.hash = "#/login";
      return;
    }

    // Menyembunyikan navbar dan header jika berada di halaman login
    const header = document.querySelector(".container-profile");
    const navbar = document.querySelector(".tooltip-container");
    const miniNavbar = document.querySelector(".container_bottnav");
    const settingNav = document.getElementById("settingsPage");

    // Cek apakah URL ada dalam rute
    const isPage = routes[url];
    if (!isPage) {
      // Jika tidak ada, arahkan ke halaman 404
      header.style.display = "none";
      navbar.style.display = "none";
      miniNavbar.style.display = "none";
      this._content.innerHTML = `${create404Page}`;
      document.querySelector('.error-container img[alt="RBPlogo"]').src =
        RBPlogo;
      return;
    }

    if ((url === "/login") | (url === "/home/settings")) {
      header.style.display = "none"; // Sembunyikan header
      navbar.style.display = "none"; // Sembunyikan navbar
      miniNavbar.style.display = "none"; // Sembunyikan navbar
    } else {
      header.style.display = "flex"; // Tampilkan header
      navbar.style.display = "inline-block"; // Tampilkan navbar
    }


    // Username Displayer
    //
    if (token) {
      const data = await RBPsource.getUserData();
      // Menampilkan sambutan
      console.log("status", data.status);
      console.log("role", data.role);
      if (data.role === "employee") {
        navbar.style.display = "none";
        miniNavbar.style.display = "none";
        settingNav.style.display = "none";
      } else {
        navbar.style.display = "inline-block";
        miniNavbar.style.display = "flex";
        settingNav.style.display = "unset";
      }
      const welcomeMessage = `Hallo, ${data.username}!`;
      document.getElementById("welcome").innerText = welcomeMessage;

      //
      // STATUS Outlet
      const todayDate = getCurrentDate().pickedDate;
      let isOpen = (await allPredictionDataByDate(todayDate)).operasional;
      console.log("isopen", isOpen);
      // Set nilai dari button-3 berdasarkan nilai variabel
      const checkbox = document.querySelector("#button-3 .checkbox");
      checkbox.checked = isOpen;

      // Event listener untuk menangkap perubahan kondisi
      let debounceTimeout;
      checkbox.addEventListener("change", async function () {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
          if (this.checked) {
            console.log("Open");
            await putPredictionData({ operasional: true }, todayDate);
          } else {
            console.log("Close");
            await putPredictionData({ operasional: false }, todayDate);
          }
        }, 300); // Tunggu 300ms sebelum mengirim permintaan
      });
    }

    // Render halaman sesuai route
    const page = routes[url];
    // Gunakan fungsi handleFetch di semua rute
    this._content.innerHTML = await page.render();

    await page.afterRender();
  }
}

export default App;
