import "regenerator-runtime"; // Import regenerator-runtime untuk mendukung async/await
import App from "./views/app"; // Import kelas App
import "../styles/style.css"; // Import stylesheet utama
import "../styles/responsive.css"; // Import stylesheet responsif



// Event listener untuk DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
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
});

// Inisialisasi objek App
const app = new App({
  content: document.querySelector("#mainContent"),
});

// Event listener untuk hashchange, render halaman saat hash berubah
window.addEventListener("hashchange", () => {
  app.renderPage();
});

// Event listener untuk load, render halaman saat halaman pertama kali dimuat
window.addEventListener("load", () => {
  app.renderPage();
});
