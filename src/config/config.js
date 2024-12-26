  const CONFIG = {
    BASE_URL: "http://192.168.1.4:5000/api/",
  };

  const API_ENDPOINT = {
    SALES: `${CONFIG.BASE_URL}sales`,
    FINANCE: `${CONFIG.BASE_URL}finance`,
    STOCKS: `${CONFIG.BASE_URL}stocks`,
    DAFTARBELANJA: `${CONFIG.BASE_URL}daftarBelanja`,
    PREDICTION: `${CONFIG.BASE_URL}prediction`,
    STATUS: `${CONFIG.BASE_URL}status`,
    BAHAN: `${CONFIG.BASE_URL}bahan`,
    AUTH: `${CONFIG.BASE_URL}auth`,
    UPDATE_DAFTARBELANJA: (id) => `${CONFIG.BASE_URL}daftarBelanja/${id}`,
  };

  export default API_ENDPOINT;