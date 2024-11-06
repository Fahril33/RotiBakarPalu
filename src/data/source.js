import API_ENDPOINT from "../config/config";

class RBPsource {
  static async salesData() {
    try {
      const response = await fetch(API_ENDPOINT.SALES);
      const responseJson = await response.json();

      // Log data yang diterima untuk debugging
      // console.log("Data penjualan diterima:", responseJson);

      // Jika API mengembalikan object dengan key 'data' berisi array, akses dengan benar
      return responseJson.data || responseJson; // pastikan mengembalikan array
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }
  }
  static async getDaftarBelanja() {
    try {
      const response = await fetch(API_ENDPOINT.DAFTARBELANJA);
      const responseJson = await response.json();

      // console.log("Data belanja diterima:", responseJson);

      return responseJson;
    } catch (error) {
      console.error("Error fetching daftarBelanja:", error);
      return [];
    }
  }

  static async getStocks() {
    try {
      const response = await fetch(API_ENDPOINT.STOCKS);
      const responseJson = await response.json();

      // console.log("Data stock diterima:", responseJson);

      return responseJson;
    } catch (error) {
      console.error("Error fetching stocks:", error);
      return [];
    }
  }
}

export default RBPsource;
