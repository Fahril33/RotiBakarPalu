const Login = {
  async render() {
    return `
      <div class="login-container">
        <h2>Login</h2>
        <form id="loginForm">
          <input type="text" id="email" placeholder="Email" required />
          <input type="password" id="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    `;
  },

  async afterRender() {
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      await this.login(email, password);
    });
  },

  async login(email, password) {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        window.location.hash = "#/home"; // Redirect ke halaman utama
      } else {
        alert("Login gagal, silakan coba lagi.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan saat login.");
    }
  },

  // Tambahkan metode logout
  async logout() {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Jika menggunakan token di header
        },
      });

      if (response.ok) {
        // Hapus token dari localStorage
        localStorage.removeItem("token");

        // Redirect ke halaman login
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
  },
};

export default Login;
