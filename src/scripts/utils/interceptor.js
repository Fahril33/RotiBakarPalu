import Swal from "sweetalert2";
import UrlParser from "../routes/url-parser";
import RBPsource from "../../data/source";

// Contoh fungsi interceptor
async function checkTokenExpiration(response) {
  // Jika response status 401 (Unauthorized),
  // kemungkinan token sudah expired
  if (response.status === 401) {
    // Logout otomatis
    localStorage.removeItem("token");
    window.location.hash = "#/login";
    return false;
  }
  return true;
}

// Contoh penggunaan di fungsi fetch
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");

  const defaultHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Cek token expiration
  const isValidToken = await checkTokenExpiration(response);

  if (!isValidToken) {
    return null;
  }

  return response;
}

// Fungsi untuk menangani semua permintaan HTTP
async function handleFetch(url, options) {
  return await fetchWithAuth(url, options);
}

export { fetchWithAuth, handleFetch };

export async function urlOtorizator() {
  const url = UrlParser.parseActiveUrlWithCombiner();
  const token = localStorage.getItem("token");

  if (token) {
    // Mengatur header untuk permintaan
    const headers = {
      "x-auth-token": token,
    };

    // Mengambil data pengguna
    fetch("http://localhost:5000/api/auth/user", {
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
    console.log("No token found, please log in.");
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
