import bagIcon from "../../../public/item/bag.png";
import soldIcon from "../../../public/item/money-bag.png";
import weatherIcon from "../../../public/item/cloudy.png";
import tomorrowWeatherIcon from "../../../public/item/sun.png";
import weekendIcon from "../../../public/item/weekend.png";
import eventIcon from "../../../public/item/ketupat.png";
import homeIcon from "../../../public/home.png";
import activityIcon from "../../../public/activity.png";
import walletIcon from "../../../public/wallet.png";

export const setIcons = () => {
  document.getElementById("imgPredict").src = bagIcon;
  document.querySelector('img[alt="soldIcon"]').src = soldIcon;
  document.querySelector('img[alt="weatherIcon"]').src = weatherIcon;
  document.querySelector('img[alt="tomorowWeatherIcon"]').src =
    tomorrowWeatherIcon;
  document.querySelector('img[alt="weekendIcon"]').src = weekendIcon;
  document.querySelector('img[alt="eventIcon"]').src = eventIcon;
  document.querySelector('.container-item img[alt="Beranda Icon"]').src =
    homeIcon;
  document.querySelector('.container-item img[alt="Penjualan Icon"]').src =
    activityIcon;
  document.querySelector('.container-item img[alt="Keuangan Icon"]').src =
    walletIcon;
};

export const autoDate = () => {
  const dateElement = document.querySelector(".date");
  const exampleDate = new Date("2024-06-14");
  const options = { day: "numeric", month: "long", year: "numeric" };
  dateElement.textContent = `Penjualan ${exampleDate.toLocaleDateString(
    "id-ID",
    options
  )} | [Cuaca] | [AkhirPekan] | [event]`;
};

export const generateID = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hour}${minute}${second}`;
};
