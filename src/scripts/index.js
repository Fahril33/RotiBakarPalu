import "regenerator-runtime";
import App from "./views/app";
import "../styles/style.css";
import "../styles/loader.css";
import "../styles/finance.css";
import "../styles/responsive.css";
import "../styles/home.css";

import {
  homeIcon,
  activityIcon,
  walletIcon,
  navigationIcon,
} from "./utils/icons";
import { getCurrentDate } from "./utils/datePicker";
import { allPredictionDataByDate } from "../data/allData";
import { putPredictionData } from "../data/utils/predictionHandler";

document.querySelector('.item-icons img[alt="Beranda Icon"]').src = homeIcon;
document.querySelector('.item-icons img[alt="Penjualan Icon"]').src =
  activityIcon;
document.querySelector('.item-icons img[alt="Keuangan Icon"]').src = walletIcon;
document.querySelector('.button-content img[alt="Navigation Icon"]').src =
  navigationIcon;

document.querySelector('.item-icon img[alt="Beranda Icon"]').src = homeIcon;
document.querySelector('.item-icon img[alt="Penjualan Icon"]').src =
  activityIcon;
document.querySelector('.item-icon img[alt="Keuangan Icon"]').src = walletIcon;

// Event listener untuk DOMContentLoaded
document.addEventListener("DOMContentLoaded", async function () {
  const profileContainer = document.querySelector(".profile-container"); // Ambil elemen profile-container
  const profileIcon = document.querySelector(".profile-icon"); // Ambil elemen profile-icon

  // Toggle class 'open' pada profileContainer saat profileIcon diklik
  profileIcon.addEventListener("click", function () {
    profileContainer.classList.toggle("open");
  });

  // Tutup profileContainer jika klik di luar elemen tersebut
  document.addEventListener("click", function (event) {
    if (!profileContainer.contains(event.target)) {
      profileContainer.classList.remove("open");
    }
  });

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

  // LOGOUT LISTENER
  const logoutLink = document.querySelector('a[href="#/login"]');
  if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
      event.preventDefault(); // Mencegah navigasi default
      handleLogout();
    });
  }
});

// Inisialisasi objek App
const app = new App({
  content: document.querySelector("#mainContent"),
});

// Event listener untuk hashchange, render halaman saat hash berubah
window.addEventListener("hashchange", () => {
  app.renderPage();
});

function handleLogout() {
  // Hapus token dari localStorage
  localStorage.removeItem("token");

  // Optional: Hapus data pengguna lainnya jika ada
  // localStorage.removeItem("userData");

  // Redirect ke halaman login
  window.location.hash = "#/login";
}

// Event listener untuk load, render halaman saat halaman pertama kali dimuat
window.addEventListener("load", () => {
  app.renderPage();
});

const backToTopButton = document.querySelector(".button-content")
 backToTopButton.onclick = function () {
   window.scrollTo({
     top: 0,
     behavior: "smooth", // Menggulung dengan halus
   });  
 };

 let lastScrollTop = 0;
 const navbar = document.querySelector(".container_bottnav");

 window.addEventListener("scroll", function () {
   let scrollTop = window.scrollY || document.documentElement.scrollTop;

   if (scrollTop > lastScrollTop) {
     // Scrolling down
     navbar.classList.add("navbar-hidden");
   } else {
     // Scrolling up
     navbar.classList.remove("navbar-hidden");
   }

   lastScrollTop = scrollTop;
 });
  