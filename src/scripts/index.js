import "regenerator-runtime";
import App from "./views/app";
import "../styles/style.css";
import "../styles/loader.css";
import "../styles/finance.css";
import "../styles/responsive.css";
import "../styles/home.css";
// import "../styles/login.css";
// import jwt from "jsonwebtoken";

import {
  homeIcon,
  activityIcon,
  walletIcon,
  navigationIcon,
} from "./utils/icons";
import { manualSyncData } from "./utils/syncData";

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

  //
  // HEADER
  // Tutup profileContainer jika klik di luar elemen tersebut
  document.addEventListener("click", function (event) {
    if (!profileContainer.contains(event.target)) {
      profileContainer.classList.remove("open");
    }
  });

  // LOGOUT LISTENER
  //
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
window.addEventListener("hashchange", async () => {
  app.renderPage();
});

async function handleLogout() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token, // Jika menggunakan token di header
      },
    });

    if (response.ok) {
      // Hapus token dari localStorage
      localStorage.removeItem("token");

      // Redirect ke halaman login
      console.log("anda logout");
      window.location.hash = "#/login";
    } else {
      console.error("Logout gagal");
      // Tetap logout di sisi client meskipun request gagal
      localStorage.removeItem("token");
      window.location.hash = "#/login";
    }
  } catch (error) {
    console.error("Logout error:", error);
    // Fallback logout
    localStorage.removeItem("token");
    window.location.hash = "#/login";
  }
}

// Event listener untuk load, render halaman saat halaman pertama kali dimuat
window.addEventListener("load", () => {
  app.renderPage();
});

const backToTopButton = document.querySelector(".button-content");
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

const manualUpdateButton = document.getElementById("manualUpdate");

// Menambahkan event listener untuk click
manualUpdateButton.addEventListener("click", function () {
  manualSyncData();
});
