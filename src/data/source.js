import API_ENDPOINT from "../config/config";

class RBPsource {
  static async salesData() {
    try {
      const response = await fetch(API_ENDPOINT.SALES);
      const responseJson = await response.json();

      // Log data yang diterima untuk debugging
      console.log("Data received from API:", responseJson);

      // Jika API mengembalikan object dengan key 'data' berisi array, akses dengan benar
      return responseJson.data || responseJson; // pastikan mengembalikan array
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }
  }
}

export default RBPsource;
