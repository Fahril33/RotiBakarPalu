  const CONFIG = {
    BASE_URL: "http://localhost:4000/api/",
  };

  const API_ENDPOINT = {
    SALES: `${CONFIG.BASE_URL}sales`,
    FINANCE: `${CONFIG.BASE_URL}finance`,
    STOCKS: `${CONFIG.BASE_URL}stocks`,
    DAFTARBELANJA: `${CONFIG.BASE_URL}daftarBelanja`,
    PREDICTION: `${CONFIG.BASE_URL}prediction`,
    UPDATE_DAFTARBELANJA: (id) => `${CONFIG.BASE_URL}daftarBelanja/${id}`,
  };

  export default API_ENDPOINT;