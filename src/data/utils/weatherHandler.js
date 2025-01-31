import {
  getCurrentDate,
  getTomorrowDate,
} from "../../scripts/utils/datePicker";
import { allPredictionDataByDate } from "../allData";
import { getCuacaJam17 } from "../source";
import { postPredictionData, putPredictionData } from "./predictionHandler";

async function weatherData() {
  const { cuacaData1, cuacaData2, cuacaData3 } = await getCuacaJam17();

  console.log("1", cuacaData1);
  console.log("2", cuacaData2);
  console.log("3", cuacaData3);

  const todayString = getCurrentDate().pickedDate;
  const tomorrowString = getTomorrowDate().tomorrowDate;
  console.log("tms", tomorrowString);

  // Buat array dari data cuaca
  const cuacaDataArray = [cuacaData1, cuacaData2, cuacaData3];

  // Filter data berdasarkan local_datetime
  const filteredTodayData = cuacaDataArray.filter((data) => {
    if (data && data.local_datetime) {
      const localDate = data.local_datetime.split(" ")[0]; // Ambil hanya bagian tanggal
      console.log("localDate", localDate);
      return localDate === todayString; // Bandingkan dengan tanggal hari ini
    }
    return false; // Jika data tidak ada, kembalikan false
  });

  const filteredTomorrowData = cuacaDataArray.filter((data) => {
    if (data && data.local_datetime) {
      const localDate = data.local_datetime.split(" ")[0]; // Ambil hanya bagian tanggal
      // console.log("localDate", localDate);
      return localDate === tomorrowString; // Bandingkan dengan tanggal besok
    }
    return false; // Jika data tidak ada, kembalikan false
  });

  // Tampilkan hasil yang sudah difilter
  console.log("Data cuaca hari ini:", filteredTodayData);
  console.log("Data cuaca besok:", filteredTomorrowData);

  // Fungsi untuk mengonversi deskripsi cuaca menjadi kategori
  function konversiCuaca(weatherDesc) {
    const hujanKeywords = [
      "hujan",
      "hujan ringan",
      "rintik",
      "lebat",
      "intensitas tinggi",
    ];
    const mendungKeywords = ["mendung", "berawan", "awan", "berawan tebal"];
    const cerahKeywords = ["cerah", "cerah berawan", "sedikit awan"];

    // Cek apakah deskripsi cuaca mengandung kata kunci untuk hujan
    if (
      hujanKeywords.some((keyword) =>
        weatherDesc.toLowerCase().includes(keyword)
      )
    ) {
      return "hujan";
    }
    // Cek apakah deskripsi cuaca mengandung kata kunci untuk mendung
    else if (
      mendungKeywords.some((keyword) =>
        weatherDesc.toLowerCase().includes(keyword)
      )
    ) {
      return "mendung";
    }
    // Cek apakah deskripsi cuaca mengandung kata kunci untuk cerah
    else if (
      cerahKeywords.some((keyword) =>
        weatherDesc.toLowerCase().includes(keyword)
      )
    ) {
      return "cerah";
    }
    // Jika tidak ada yang cocok, kembalikan 'tidak diketahui'
    return "tidak diketahui";
  }

  let todayWeather = "none";
  let tomorrowWeather = "none";

  if (filteredTodayData.length > 0) {
    const todayWeatherDesc = filteredTodayData[0].weather_desc;
    todayWeather = konversiCuaca(todayWeatherDesc);
    console.log("TDW", todayWeather);
  }

  if (filteredTomorrowData.length > 0) {
    const tomorrowWeatherDesc = filteredTomorrowData[0].weather_desc;
    tomorrowWeather = konversiCuaca(tomorrowWeatherDesc);
    console.log("TMW", tomorrowWeather);
  }

  return {
    todayWeather,
    tomorrowWeather,
  };
}

export async function checkWeatherData() {
  const data = await weatherData();
  const { todayWeather, tomorrowWeather } = data;

  console.log("tdw", todayWeather);
  console.log("tmw", tomorrowWeather);

  const currentDate = getCurrentDate().pickedDate;
  const tomorrowDate = getTomorrowDate().tomorrowDate;

  //
  // Today
  //

  const isAnyToday = (await allPredictionDataByDate(currentDate)).filteredData;
  console.log('isAnyToday', isAnyToday);
  if (isAnyToday === `none`) {
    const weatherPredictionDataPost = {
      date: currentDate,
      weekend: false,
      libur: false,
      cuaca: todayWeather,
      cuaca_besok: tomorrowWeather,
      event_raya: "",
      terjual: "",
      manual_update: false,
      operasional: false,
      hasil_prediksi: "",
    };
    await postPredictionData(weatherPredictionDataPost);
  } else {
    const todayWeatherValue = (await allPredictionDataByDate(currentDate))
      .cuaca;
    // console.log("twv", todayWeatherValue);
    if (todayWeatherValue === "none" || todayWeatherValue === "") {
      const weatherPredictionDataPutNone = {
        cuaca: todayWeather,
        cuaca_besok: tomorrowWeather,
      };
      putPredictionData(weatherPredictionDataPutNone, currentDate);
    } else {
      const weatherPredictionDataPut = {
        cuaca_besok: tomorrowWeather,
      };
      putPredictionData(weatherPredictionDataPut, currentDate);
    }
  }

  //
  // Tomorrow
  //

  function isTomorrowWeekend() {
    const currentDate = new Date(); // Mengambil tanggal saat ini
    const tomorrow = new Date(currentDate);
    tomorrow.setDate(currentDate.getDate() + 1); // Mengatur tanggal ke hari besok
    const day = tomorrow.getDay(); // Mengambil hari dalam bentuk angka (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)

    // Mengembalikan true jika hari besok adalah Sabtu (6) atau Minggu (0)
    return day === 0 || day === 6;
  }

  const isAnyTomorrow = (await allPredictionDataByDate(tomorrowDate))
    .filteredData;
  if (isAnyTomorrow === `none`) {
    console.log("tmtom gada");
    const tomorrowWeatherPredictionDataPost = {
      date: tomorrowDate,
      weekend: isTomorrowWeekend(),
      libur: false,
      cuaca: tomorrowWeather,
      cuaca_besok: "unknown",
      event_raya: "",
      terjual: "",
      manual_update: false,
      operasional: false,
      hasil_prediksi: "",
    };
    await postPredictionData(tomorrowWeatherPredictionDataPost);
  } else {
    const tomorowWeatherValue = (await allPredictionDataByDate(tomorrowDate))
      .cuacaBesok;
    if (tomorowWeatherValue === "") {
      const tomorrowWeatherPredictionDataPut = {
        cuaca: tomorrowWeather,
        cuaca_besok: "unknown",
      };
      await putPredictionData(tomorrowWeatherPredictionDataPut, tomorrowDate);
    } else {
      const tomorrowWeatherPredictionDataPut = {
        cuaca: tomorrowWeather,
      };
      await putPredictionData(tomorrowWeatherPredictionDataPut, tomorrowDate);
    }
  }
}
