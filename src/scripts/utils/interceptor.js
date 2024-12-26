import Swal from "sweetalert2";
import UrlParser from "../routes/url-parser";
import RBPsource from "../../data/source";
import API_ENDPOINT from "../../config/config";
import { closeModal } from "./sales/modal-handler";

export async function urlOtorizator() {
  const url = UrlParser.parseActiveUrlWithCombiner();
  const token = localStorage.getItem("token");

  if (token) {
    // Mengatur header untuk permintaan
    const headers = {
      "x-auth-token": token,
    };

    // Mengambil data pengguna
    fetch(`${API_ENDPOINT.AUTH}/user`, {
      method: "GET",
      headers: headers,
    })
      .then((response) => {
        if (response.status === 401) {
          // Logout otomatis
          localStorage.removeItem("token");
          window.location.hash = "#/login";
          Swal.fire({
            title: "Sesi Anda Habis!",
            text: "Harap masuk kembali untuk mengakses.",
            icon: "error",
            confirmButtonText: "OK",
          });
        } else if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(async (data) => {
        // Otorisasi Halaman
        if (data.role === "employee" && data.status === "inactive") {
          Swal.fire({
            title: "Peringatan!",
            text: "Status Anda tidak aktif. Silakan hubungi manager.",
            icon: "warning",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("token");
              window.location.hash = "#/login";
            }
          });
        } else if (data.role === "employee" && url === "/login") {
          window.location.hash = "#/sales";
        } else if (data.role === "manager" && url === "/login") {
          window.location.hash = "#/home";
          return;
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  } else {
    Swal.fire({
      icon: "warning",
      title: "Silahkan masuk kembali.",
      position: "top-end",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      toast: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      },
    });
  }
}

export async function checkUserRole() {
  // Dapatkan role pengguna dari local storage atau state management
  const currentUserRole = await RBPsource.getUserData();
  // console.log("cur", currentUserRole);
  if (!currentUserRole) {
    window.location.hash = "#/login";
    return;
  }

  // console.log('rolee', currentUserRole.role);

  // Daftar role yang diizinkan untuk halaman ini
  const allowedRoles = ["manager"];

  if (!allowedRoles.includes(currentUserRole.role)) {
    // Redirect ke halaman tidak diizinkan

    return false;
  }
  return true;
}

export async function serverStatusWatcher() {
  let serverStatus;
  setInterval(async () => {
    serverStatus = (await RBPsource.serverStatus()).isServerConnected;
    if (!serverStatus) {
      await reconnectServer();
    }
  }, 10000); // Interval pemeriksaan
}

export async function reconnectServer() {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: false,
    timerProgressBar: true,
    customClass: "server-toast",
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });

  const loadingToast = Toast.fire({
    html: `
        <div style="text-align: center; display: flex; gap: 10px">
          <div class="loader" style="display: block"></div>
          <span style="margin: auto;">Server terputus, menghubungkan kembali..</span>
        </div>
    `,
  });

  closeModal()

  updateUIOnServerStatus(false);

  let isServerConnected = false;
  while (!isServerConnected) {
    const serverStatus = (await RBPsource.serverStatus()).isServerConnected;
    if (serverStatus) {
      isServerConnected = true;
      loadingToast.close();
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });

      Toast.fire({
        icon: "success",
        title: "Server terhubung kembali.",
      });

      setTimeout(() => {
        location.reload();
      }, 1600); // 1 minute in milliseconds
    } else {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Tunggu 5 detik sebelum mencoba lagi
    }
  }
}

export function updateUIOnServerStatus(isConnected) {
  const url = UrlParser.parseActiveUrlWithCombiner();
  // console.log("url", url);
  if (url !== "/login") {
    return;
  }

  const loginButton = document.getElementById("loginBtn");
  const cardLoginHeader = document.querySelector(".card-login-header");

  if (isConnected) {
    loginButton.disabled = false;
    if (cardLoginHeader) {
      cardLoginHeader.style.display = "none";
    }
  } else {
    loginButton.disabled = true;
    if (cardLoginHeader) {
      cardLoginHeader.style.display = "block";
    }
  }
}
