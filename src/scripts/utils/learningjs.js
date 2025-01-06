const axios = require("axios");
const learning = require("learningjs");
const { default: API_ENDPOINT } = require("../../config/config");

async function main() {
  try {
    // Mengambil data dari API
    const response = await axios.get(API_ENDPOINT.PREDICTION);
    const allData = Array.isArray(response.data) ? response.data : [];

    if (allData.length === 0) {
      throw new Error("Data kosong atau tidak valid dari API.");
    }

    // Memfilter data
    const filteredData = allData.filter(
      (item) => item.operasional === true && item.terjual !== ""
    );

    // Memisahkan fitur (X) dan label (y)
    const X = filteredData.map((row) => [
      row.libur ? 1 : 0, // libur (1 jika true, 0 jika false)
      row.weekend ? 1 : 0, // weekend (1 jika true, 0 jika false)
      row.cuaca === "cerah" ? 1 : 0, // cuaca (1 jika cerah, 0 jika tidak)
      row.cuaca === "mendung" ? 1 : 0, // cuaca (1 jika mendung, 0 jika tidak)
      row.cuaca === "hujan" ? 1 : 0, // cuaca (1 jika hujan, 0 jika tidak)
      row.event_raya === "none" ? 0 : 1, // event_raya (1 jika none, 0 jika tidak)
      row.event_raya === "puasa" ? 1 : 0, // event_raya (1 jika puasa, 0 jika tidak)
      row.event_raya === "Hari Raya Natal" ? 1 : 0, // event_raya (1 jika Hari Raya Natal, 0 jika tidak)
      row.event_raya === "Hari Raya Idul Adha" ? 1 : 0, // event_raya (1 jika Hari Raya Idul Adha, 0 jika tidak)
      row.event_raya === "Hari Raya Idul Fitri" ? 1 : 0, // event_raya (1 jika Hari Raya Idul Fitri, 0 jika tidak)
      row.event_raya === "Tahun Baru Masehi" ? 1 : 0, // event_raya (1 jika Tahun Baru Masehi, 0 jika tidak)
      row.event_raya === "Tahun Baru Imlek" ? 1 : 0, // event_raya (1 jika Tahun Baru Imlek, 0 jika tidak)
    ]);

    const y = filteredData
      .map((row) => {
        if (row.terjual === "rendah") return 0;
        if (row.terjual === "sedang") return 1;
        if (row.terjual === "tinggi") return 2;
        return null; // Atau nilai default jika tidak dikenali
      })
      .filter((value) => value !== null); // Menghapus nilai null jika ada

    // Membuat dan melatih model Decision Tree
    const model = new learning.DecisionTree();
    model.train(X, y);

    // Membuat prediksi
    const prediction = model.predict([[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]]); // Contoh input: libur=false, weekend=false, cuaca=mendung, event_raya=none
    const predictedValue = ["rendah", "sedang", "tinggi"][prediction];
    console.log("Prediksi:", predictedValue);
  } catch (err) {
    console.error("Error:", err);
  }
}

main().catch(console.error);
