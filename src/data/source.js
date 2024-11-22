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

  static async getFinances() {
    try {
      const response = await fetch(API_ENDPOINT.FINANCE);
      const responseJson = await response.json();

      // console.log("Data finance diterima:", responseJson);

      return responseJson;
    } catch (error) {
      console.error("Error fetching stocks:", error);
      return [];
    }
  }

  static async getPredictions() {
    try {
      const response = await fetch(API_ENDPOINT.PREDICTION);
      const responseJson = await response.json();

      // console.log("Data prediction diterima:", responseJson);

      return responseJson;
    } catch (error) {
        console.error("Error fetching predictions:", error);
      return [];
    }
  }
}

// Fungsi untuk mengambil data cuaca pada jam 17:00
export async function getCuacaJam17() {
  try {
    const response = await fetch(
      "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=72.71.06.1001"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const cuaca1 = data.data[0].cuaca[0];
    const cuaca2 = data.data[0].cuaca[1];
    const cuaca3 = data.data[0].cuaca[2];
    const targetTime = "17:00:00";

    const findCuacaByTime = (cuacaData, targetDate) =>
      cuacaData.find(
        (item) =>
          item.local_datetime.startsWith(targetDate) &&
          item.local_datetime.endsWith(targetTime)
      );

    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1))
      .toISOString()
      .split("T")[0];
    const tdatomorrow = new Date(new Date().setDate(new Date().getDate() + 2))
      .toISOString()
      .split("T")[0];

    const cuacaData1 = findCuacaByTime(cuaca1, today);
    const cuacaData2 = findCuacaByTime(cuaca2, tomorrow);
    const cuacaData3 = findCuacaByTime(cuaca3, tdatomorrow);

    return { cuacaData1, cuacaData2, cuacaData3 };
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function cekTanggalPuasa() {
  // Dapatkan tanggal hari ini dalam format DD-MM-YYYY
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, "0")}-${(
    today.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${today.getFullYear()}`;
  // const formattedDate = `02-04-2024`

  try {
    // Fetch API untuk konversi tanggal
    const response = await fetch(
      `https://api.aladhan.com/v1/gToH/${formattedDate}`
    );
    const data = await response.json();

    // Periksa bulan Hijriah
    const bulanHijriah = data.data.hijri.month.en;

    // Return boolean berdasarkan bulan Ramadan
    return {
      isPuasa: bulanHijriah === "Ramaḍān",
      tanggalHijriah: data.data.hijri.date,
      bulanHijriah: bulanHijriah,
    };
  } catch (error) {
    console.error("Error fetching date conversion:", error);
    return {
      isPuasa: false,
      error: true,
    };
  }
}

export async function convertGtoH() {
  const hasilPemeriksaan = (await cekTanggalPuasa()).isPuasa;
  // console.log(hasilPemeriksaan);

  return {
    hasilPemeriksaan,
  };
}

export async function bacaHariLibur(tanggalHariIni) {
  const now = new Date();
  const nowYear = String(now.getFullYear());

  try {
    // const nowYear = "2023"
    // Fetch data dari API
    const response = await fetch(
      `https://api-harilibur.vercel.app/api?&year=${nowYear}`
    );
    const semuaHariLibur = await response.json();

    // Filter hari libur spesifik berdasarkan nama
    const hariLiburSpesifik = [
      "Hari Raya Natal",
      "Hari Raya Idul Adha",
      "Hari Raya Idul Fitri",
      "Tahun Baru Masehi",
      "Tahun Baru Imlek",
    ];

    const hariLibur = semuaHariLibur.filter((hari) =>
      hariLiburSpesifik.some((spesifik) => hari.holiday_name.includes(spesifik))
    );
    const nationalHolidays = semuaHariLibur.filter(
      (holiday) => holiday.is_national_holiday
    );
    // console.log('national Holiday', nationalHolidays);

    // Cek apakah hari ini adalah hari libur
    // const tanggalHariIni = "2024-02-10";
    // const tanggalHariIni = getCurrentDate().pickedDaten;
    const hariLiburHariIni = hariLibur.filter(
      (hari) => hari.holiday_date === tanggalHariIni
    );

    const isTodayHoliday = nationalHolidays.some(
      (holiday) => holiday.date === tanggalHariIni
    );
    // if(isTodayHoliday){
    //   console.log('libur bang', isTodayHoliday);
    // } else {
    //   console.log('bukan libur bang', isTodayHoliday);
    // }

    // Analisis data
    const analisis = {
      totalHariLibur: hariLibur.length,
      hariLiburHariIni: hariLiburHariIni,
      bulanDenganLiburTerbanyak: {},
      daftarBulan: {},
    };

    // Hitung hari libur per bulan
    hariLibur.forEach((hari) => {
      const bulan = hari.holiday_date.split("-")[1];

      if (!analisis.daftarBulan[bulan]) {
        analisis.daftarBulan[bulan] = [];
      }

      analisis.daftarBulan[bulan].push(hari);
    });

    // Fungsi pencarian hari libur
    const cariHariLibur = (tanggal) => {
      return hariLibur.find((hari) => hari.holiday_date === tanggal);
    };

    // Tampilkan detail lengkap
    // console.log("Analisis Hari Libur Spesifik 2024:");
    // console.log("Total Hari Libur:", analisis.totalHariLibur);
    // console.log("Tanggal Hari Ini:", tanggalHariIni);
    // console.log(
    //   "Hari Libur Hari Ini:",
    //   hariLiburHariIni.length > 0 ? hariLiburHariIni : "Tidak ada"
    // );

    return {
      semuaHariLibur: hariLibur,
      analisis,
      cariHariLibur,
      tanggalHariIni,
      isTodayHoliday,
    };
  } catch (error) {
    console.error("Gagal mengambil data hari libur:", error);
    return null;
  }
}

// Fungsi untuk menampilkan daftar lengkap
// function tampilkanDaftarHariLibur(hariLibur) {
//   console.log("\nDaftar Hari Libur Spesifik 2024:");
//   hariLibur.forEach((hari, index) => {
//     console.log(`${index + 1}. ${hari.holiday_date} - ${hari.holiday_name}`);
//   });
// }

// Jalankan analisis
export async function getHolidays(date) {
  const hasilHariLibur = await bacaHariLibur(date);
  console.log('hasil', hasilHariLibur);

  if (hasilHariLibur) {

    // tampilkanDaftarHariLibur(hasilHariLibur.semuaHariLibur)
    // Daftar hari libur spesifik
    const hariLiburSpesifik = [
      "Hari Raya Natal",
      "Hari Raya Idul Adha",
      "Hari Raya Idul Fitri",
      "Tahun Baru Masehi",
      "Tahun Baru Imlek",
    ];

    // Filter hari libur sesuai yang spesifik
    const liburSpesifikHariIni =
      hasilHariLibur.analisis.hariLiburHariIni.filter((hari) =>
        hariLiburSpesifik.some((spesifik) =>
          hari.holiday_name.includes(spesifik)
        )
      );

    // Jika ada hari libur hari ini
    if (liburSpesifikHariIni.length > 0) {
      // Periksa dan ambil nama hari libur yang sesuai
      for (const spesifik of hariLiburSpesifik) {
        const matchingHoliday = liburSpesifikHariIni.find((hari) =>
          hari.holiday_name.toLowerCase().includes(spesifik.toLowerCase())
        );

        if (matchingHoliday) {
          return {
            liburValue: spesifik.toLowerCase(), // Mengembalikan nama hari libur dalam format yang diinginkan
          };
        }
      }
    } else {
      console.log("Tidak ada hari libur hari ini, KERJA!");
      const isPuasa = (await convertGtoH()).hasilPemeriksaan;
      if (isPuasa) {
        return {
          liburValue: "puasa",
        };
      } else {
        return {
          liburValue: "none",
        };
      }
    }
  }
}

// getHolidays();

export default RBPsource;
