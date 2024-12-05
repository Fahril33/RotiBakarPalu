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
