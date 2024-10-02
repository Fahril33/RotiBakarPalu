import UrlParser from "../routes/url-parser";
import routes from "../routes/routes";

class App {
  constructor({ content }) {
    this._content = content; // Hanya fokus pada konten
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner(); // Parsing URL hash
    const page = routes[url]; // Ambil halaman berdasarkan routing
    this._content.innerHTML = await page.render(); // Render halaman
    await page.afterRender(); // Panggil afterRender jika ada logika tambahan
  }
}

export default App;
