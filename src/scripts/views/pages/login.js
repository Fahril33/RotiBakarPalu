import Swal from "sweetalert2";
import { urlOtorizator } from "../../utils/interceptor";
import { createLoginTemplate } from "../template/template-creator";
import { RBPlogo } from "../../utils/icons";
import "../../../styles/login.css"

const Login = {
  async render() {
    return `
      <div class="content">
        ${createLoginTemplate()}
      </div>
    `;
  },

  async afterRender() {
    document.querySelector('.card-login-items img[alt="RBPlogo"]').src =
      RBPlogo;

     const form = document.getElementById("loginForm");
     const submitButton = form.querySelector('button[type="submit"]');
     submitButton.addEventListener("click", async (event) => {
       event.preventDefault(); // Mencegah pengiriman form default
       const email = document.getElementById("email").value;
       const password = document.getElementById("password").value;

       await this.login(email, password);
     });

    //
    // togglePassword
    //

    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    const eyeIcon = document.getElementById("eyeIcon");

    togglePassword.addEventListener("click", function () {
      // Toggle the type attribute
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);

      // Toggle the eye icon
      eyeIcon.classList.toggle("fa-eye");
      eyeIcon.classList.toggle("fa-eye-slash");
    });
  },

  async login(identifier, password) {
    
    const url = "http://localhost:5000/api/auth";
    try {
      const response = await fetch(`${url}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        await urlOtorizator();
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: "success",
          title: "Anda Berhasil Masuk.",
        });
      } else {
        // Tampilkan pesan kesalahan tanpa detail sensitif
        alert("Email atau password salah. Silakan coba lagi.");
      }
    } catch (error) {
      // Tangkap kesalahan jaringan atau internal
      alert("Terjadi kesalahan saat login. Silakan coba lagi.");
      console.warn("Login error:", error.message); // Log lebih aman
    }
  },

  // Tambahkan metode logout
  async logout() {
    
  },
};

export default Login;
