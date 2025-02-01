import axios from "axios";

export async function predictSales(newData) {
  //   const newData = {
  //     weekend: "false",
  //     libur: "false",
  //     cuaca: "mendung",
  //     event_raya: "puasa",
  //   };

  try {
    const response = await axios.post("http://127.0.0.1:7000/predict", newData);
    console.log("Prediksi Penjualan:", response.data.prediction);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
}
