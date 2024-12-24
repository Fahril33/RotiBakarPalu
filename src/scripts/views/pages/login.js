import Swal from "sweetalert2";
import { reconnectServer, updateUIOnServerStatus, urlOtorizator } from "../../utils/interceptor";
import { createLoginTemplate } from "../template/template-creator";
import { RBPlogo } from "../../utils/icons";
import "../../../styles/login.css";
import RBPsource from "../../../data/source";
import UrlParser from "../../routes/url-parser";

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
    const serverStatus = (await RBPsource.serverStatus()).isServerConnected;
    console.log("serverStatus", serverStatus);

    if (!serverStatus) {
      await reconnectServer();
    }
    updateUIOnServerStatus(serverStatus);

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
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
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

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        await urlOtorizator();

        Toast.fire({
          icon: "success",
          title: "Anda Berhasil Masuk.",
        });
      } else if (response.status === 400) {
        const data = await response.json();
        const credentialEmpty = document.querySelectorAll(
          "#identifierLoginEmpty"
        );

        const identifierError = document.querySelector("#identifierLoginError");
        const passwordError = document.querySelector("#passwordLoginError");
        if (data.msg === "Identifier and password are required") {
          credentialEmpty.forEach((element) => {
            element.style.display = "inline";
          });
          identifierError.style.display = "none";
          passwordError.style.display = "none";
        } else if (data.msg === "Invalid email/username") {
          credentialEmpty.forEach((element) => {
            element.style.display = "none";
          });
          identifierError.style.display = "inline";
          passwordError.style.display = "none";
        } else if (data.msg === "Invalid password") {
          credentialEmpty.forEach((element) => {
            element.style.display = "none";
          });
          identifierError.style.display = "none";
          passwordError.style.display = "inline";
        } else {
          alert(data.msg);
        }
      } else {
        // alert("Terjadi kesalahan saat login. Silakan coba lagi.");
      }
    } catch (error) {
      // alert("Terjadi kesalahan jaringan. Silakan coba lagi.");
      console.warn("Login error:", error.message);
    }
  },

  // Tambahkan metode logout
  async logout() {},
};

export default Login;
