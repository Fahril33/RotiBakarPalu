export function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const dayn = String(now.getDate());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const formattedDate = `${year}-${month}-${day}`;
  
  var datePicker = document.getElementById("dataDatePicker");
  if (datePicker) {
    datePicker.value = formattedDate;
  } else {
    console.log("Elemen dengan ID 'dataDatePicker' tidak ditemukan.");
  }
  return {
    pickedDate: formattedDate,
    pickedDaten: `${year}-${month}-${dayn}`,
    month: month,
    year: year,
    // pickedDate: "2024-10-31",
    reFormattedDate: `${day}-${month}-${year}`,
  };
}
export function getTomorrowDate() {
  const now = new Date();
  now.setDate(now.getDate() + 1); // Increment the date by 1
  const day = String(now.getDate()).padStart(2, "0");
  const dayn = String(now.getDate());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  const formattedDate = `${year}-${month}-${day}`;

  return {
    tomorrowDate: formattedDate,
    pickedDaten: `${year}-${month}-${dayn}`,
    reFormattedDate: `${day}-${month}-${year}`,
  };
}

export async function datePickerValue() {
  const dateValue = document.getElementById("dataDatePicker").value;
  return { dateValue };
}

export function getYesterdayDate() {
  const now = new Date();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayDay = String(yesterdayDate.getDate()).padStart(2, "0");
  const yesterdayMonth = String(yesterdayDate.getMonth() + 1).padStart(2, "0");
  const yesterdayYear = String(yesterdayDate.getFullYear());
  const yesterday = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;
  return {
    yesterday,
  };
}

export async function minusOneDayDate() {
  const minusOneDateValue = (await datePickerValue()).dateValue; // Misalnya ini menghasilkan '2024-11-06'

  // Mengubah string tanggal menjadi objek Date
  const date = new Date(minusOneDateValue);

  // Mengurangi satu hari
  date.setDate(date.getDate() - 1);

  // Mengubah kembali ke format string (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Bulan dimulai dari 0
  const day = String(date.getDate()).padStart(2, "0");

  const resultDate = `${year}-${month}-${day}`;

  // console.log("Tanggal -1 hari:", resultDate);

  return {
    resultDate,
  };
}
