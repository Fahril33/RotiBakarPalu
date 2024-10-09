// src/data/sales-source.js
import API_ENDPOINT from "../config/config";

const SalesSource = {
  async fetchSalesData() {
    try {
      const response = await fetch(API_ENDPOINT.SALES);
      if (!response.ok) {
        throw new Error("Failed to fetch sales data.");
      }
      const salesData = await response.json();
      return salesData;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }
  },

  async saveSaleData(saleData) {
    try {
      const response = await fetch(API_ENDPOINT.SALES, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        throw new Error("Failed to save sale data.");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error saving sale data:", error);
      throw error;
    }
  },

  async updateSaleData(id, saleData) {
    try {
      const response = await fetch(`${API_ENDPOINT.SALES}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        throw new Error("Failed to update sale data.");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating sale data:", error);
      throw error;
    }
  },

  async deleteSaleData(id) {
    try {
      const response = await fetch(`${API_ENDPOINT.SALES}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sale data.");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting sale data:", error);
      throw error;
    }
  },
};

export default SalesSource;
