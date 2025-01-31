// import axios from "axios";
// import API_ENDPOINT from "../../config/config";

// export async function dataConverter() {
//   const { Parser } = require("json2csv");
//   const fs = require("fs");

//   const response = await axios.get(API_ENDPOINT.PREDICTION);
//   const allData = Array.isArray(response.data) ? response.data : [];

//   if (allData.length === 0) {
//     throw new Error("Data kosong atau tidak valid dari API.");
//   }
//   const jsonData = allData.filter(
//     (item) => item.operasional === true && item.terjual !== ""
//   );

//   if (!Array.isArray(jsonData)) {
//     throw new Error("jsonData is not an array.");
//   }

//   // Mengatur field yang akan diekspor ke CSV
//   const fields = [
//     "weekend",
//     "libur",
//     "cuaca",
//     "event_raya",
//     "terjual",
//   ];

//   // // Membuat parser
//   // const json2csvParser = new Parser({ fields });

//   // // Mengubah JSON ke CSV
//   // const csv = json2csvParser.parse(jsonData);

//   // // Menyimpan CSV ke file
//   // fs.writeFile("data.csv", csv, (err) => {
//   //   if (err) {
//   //     console.error("Error writing CSV file:", err);
//   //   } else {
//   //     console.log("CSV file has been saved.");
//   //   }
//   // });
// }


// try {
//   const response = await axios.get(API_ENDPOINT.PREDICTION);
//   const allData = Array.isArray(response.data) ? response.data : [];

//   if (allData.length === 0) {
//     throw new Error("Data kosong atau tidak valid dari API.");
//   }

//   const filteredData = allData.filter(
//     (item) =>
//       item.operasional === true && item.terjual !== "" && item.event_raya !== ""
//   );
//   const wTinggi = allData.filter(
//     (item) =>
//       item.operasional === true &&
//       item.terjual !== "" &&
//       item.terjual === "tinggi" &&
//       item.weekend === true &&
//       item.libur === false &&
//       item.cuaca === "mendung"
//   );
//   const wSedang = allData.filter(
//     (item) =>
//       item.operasional === true &&
//       item.terjual !== "" &&
//       item.terjual === "sedang" &&
//       item.weekend === true &&
//       item.libur === false &&
//       item.cuaca === "mendung"
//   );
//   const wRendah = allData.filter(
//     (item) =>
//       item.operasional === true &&
//       item.terjual !== "" &&
//       item.terjual === "rendah" &&
//       item.weekend === true &&
//       item.libur === false &&
//       item.cuaca === "mendung"
//   );
//   console.log("wRendah", wRendah);
//   console.log("wSedang", wSedang);
//   console.log("wTinggi", wTinggi);

//   console.log(`Data training length: ${filteredData.length}`);
//   const formattedData = filteredData.map((item) => [
//     item.event_raya,
//     item.weekend,
//     item.libur,
//     item.cuaca,
//     item.terjual,
//   ]);

//   const features = ["event_raya", "weekend", "libur", "cuaca"];
//   const featureTypes = ["category", "category", "category", "category"];
//   const target = 4;

//   const c45 = new C45();
//   return new Promise((resolve, reject) => {
//     c45.train(
//       {
//         data: formattedData,
//         target: target,
//         features: features,
//         featureTypes: featureTypes,
//       },
//       (error, model) => {
//         if (error) {
//           console.error("Training Error:", error);
//           reject("Error training the model:" + error);
//           return;
//         }

//         // Tambahkan pengecekan sebelum klasifikasi
//         if (!model) {
//           console.error("Model tidak terbentuk");
//           reject("Model tidak terbentuk");
//           return;
//         }
//         console.log("model", model);

//         console.log("Model berhasil dibuat");

//         try {
//           const predictTodayData = model.classify(testData[0]);
//           const predictTomorrowData = model.classify(testData[1]);

//           console.log("Predict Today Raw:", predictTodayData);
//           console.log("Predict Tomorrow Raw:", predictTomorrowData);

//           resolve({
//             predictTodayData,
//             predictTomorrowData,
//           });
//         } catch (classifyError) {
//           console.error("Klasifikasi Error:", classifyError);
//           reject(classifyError);
//         }
//       }
//     );
//   });
// } catch (error) {
//   console.error("Error fetching data from API:", error);
//   throw error; // Re-throw the error to handle it in the calling function
// }