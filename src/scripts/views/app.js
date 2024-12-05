import UrlParser from "../routes/url-parser";
import routes from "../routes/routes";
import { handleFetch } from "../utils/interceptor";

class App {
  constructor({ content }) {
    this._content = content;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const token = localStorage.getItem("token");

    // Cek apakah halaman memerlukan autentikasi
    const authRequiredPages = ["/", "/home", "/sales", "/finance"];

    // Logika redirect untuk logout
    if (!token && authRequiredPages.includes(url)) {
      window.location.hash = "#/login";
      return;
    }

    if (token && url === "/login") {
      window.location.hash = "#/home";
      return;
    }

    // Menyembunyikan navbar dan header jika berada di halaman login
    const header = document.querySelector(".container-profile");
    const navbar = document.querySelector(".tooltip-container");

    if (url === "/login") {
      header.style.display = "none"; // Sembunyikan header
      navbar.style.display = "none"; // Sembunyikan navbar
    } else {
      header.style.display = "flex"; // Tampilkan header
      navbar.style.display = "inline-block"; // Tampilkan navbar
    }

    // Render halaman sesuai route
    const page = routes[url];
    // Gunakan fungsi handleFetch di semua rute
    page.fetch = handleFetch;
    this._content.innerHTML = await page.render();
    await page.afterRender();
  }
}

export default App;
