import API_ENDPOINT from "../../config/config";
import { getCurrentDate } from "../../scripts/utils/datePicker";
import { allStockDataByDate, allStocksData } from "../allData";

export async function putStockData(
  date,
  initialStock,
  additionalStock,
  todayTotalStock,
  todayRemainingStock
) {
  try {
    const response = await fetch(`${API_ENDPOINT.STOCKS}/date/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        initial_stock: initialStock,
        additional_stock: additionalStock,
        total_stock: todayTotalStock,
        remaining_stock: todayRemainingStock,
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data stok.");
    }
    console.log("Data stok berhasil diperbarui melalui PUT.");
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan PUT data stok:", error);
  }
}

export async function putNewStockData(date, stockData) {
  try {
    const response = await fetch(`${API_ENDPOINT.STOCKS}/date/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockData),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data stok.");
    }
    console.log("Data stok berhasil diperbarui melalui PUT.");
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan PUT data stok:", error);
  }
}

export async function updateSoldStockData(sold, remainingStock, date) {
  try {
    const response = await fetch(`${API_ENDPOINT.STOCKS}/date/${date}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sold_stock: sold,
        remaining_stock: remainingStock,
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data stok.");
    }
    console.log("Data sold stok berhasil diperbarui melalui PUT.");
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan PUT data stok:", error);
  }
}

export async function postStockData(stockData) {
  try {
    const response = await fetch(`${API_ENDPOINT.STOCKS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stockData),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan data stok.");
    }
    const data = await response.json();
    console.log("Data stok berhasil disimpan melalui POST:", data);
  } catch (error) {
    console.error("Terjadi kesalahan saat melakukan POST data stok:", error);
  }
}

export async function isStocksDataExist() {
  const anyStockData = (await allStocksData()).todayStock;
  console.log("anystockdata", anyStockData);
  const yesterdayRemainingStock = (await allStocksData())
    .yesterdayRemainingStock;

  const date = getCurrentDate().pickedDate;
  
  if (anyStockData == 0) {
    const emptyData = {
      date: date,
      initial_stock: yesterdayRemainingStock,
      additional_stock: 0,
      bonus_stock: 0,
      spoiled_stock: 0,
      sold_stock: 0,
      remaining_stock: yesterdayRemainingStock,
      total_stock: yesterdayRemainingStock,
    };
    console.log("calon data", emptyData);

    postStockData(emptyData);
    const newTodatStockDataExist = (await allStocksData()).todayStock;
    console.log("data gaada, nih yang baru", newTodatStockDataExist);
  } else {
    console.log("ada", anyStockData);
  }
}

export async function isAnyStockDataShell(date) {
  const emptyData = {
    date: date,
    initial_stock: 0,
    additional_stock: 0,
    bonus_stock: 0,
    spoiled_stock: 0,
    sold_stock: 0,
    remaining_stock: 0,
    total_stock: 0,
  };
  postStockData(emptyData);
  const newTodayStockDataExist = (await allStockDataByDate(date)).filteredData;
  console.log("shell gaada, nih yang baruu", newTodayStockDataExist);
}

export async function stockConverter(value) {
  if (value >= 0 && value <= 5) {
    return "rendah";
  } else if (value >= 6 && value <= 15) {
    return "sedang";
  } else if (value > 15) {
    return "tinggi";
  } else {
    return "Nilai tidak valid"; // Menangani nilai negatif atau tidak valid
  }
}
