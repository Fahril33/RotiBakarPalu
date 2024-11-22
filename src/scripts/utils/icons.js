import bagIcon from "../../public/item/bag.png";
import soldIcon from "../../public/item/money-bag.png";
import weatherIcon from "../../public/item/cloudy.png";
import tomorrowWeatherIcon from "../../public/item/sun.png";
import weekendIcon from "../../public/item/weekend.png";

import homeIcon from "../../public/home.png";
import activityIcon from "../../public/activity.png";
import walletIcon from "../../public/wallet.png";
import navigationIcon from "../../public/navigation.png";

import cerah from "../../public/item/cerah.png";
import mendung from "../../public/item/mendung.png";
import hujan from "../../public/item/hujan.png";
import unknown from "../../public/item/unknown.png";
import weekend from "../../public/item/weekend.png";
import weekday from "../../public/item/weekday.png";
import unknownDate from "../../public/item/unknownDate.png";
import eidAdha from "../../public/item/eidAdha.png";
import eidFitr from "../../public/item/eidFitr.png";
import christmas from "../../public/item/christmas.png";
import chineseNY from "../../public/item/chineseNY.png";
import newYear from "../../public/item/newYear.png";
import normalDay from "../../public/item/normalDay.png";
import holiday from "../../public/item/holiday.png";
import puasa from "../../public/item/puasa.png";
import editIcon from "../../public/editIcon.png";



const weatherIconMap = {
  cerah: cerah,
  mendung: mendung,
  hujan: hujan,
  unknown: unknown,
};

const weekendIconMap = {
  true: weekend,
  false: weekday, 
  unknown: unknownDate
};

const holidayIconMap = {
  true: holiday,
  unknown: unknownDate
}


const holidaysIconMap = {
  "puasa": puasa,
  "Hari Raya Idul Adha": eidAdha,
  "Hari Raya Idul Fitri": eidFitr,
  "Tahun Baru Imlek": chineseNY,
  "Hari Raya Natal": christmas,
  "Tahun Baru Masehi": newYear,
  none: normalDay,
  "": normalDay,
  unknown: unknownDate,
};

export {
  bagIcon,
  soldIcon,
  weatherIcon,
  tomorrowWeatherIcon,
  weekendIcon,
  homeIcon,
  activityIcon,
  walletIcon,
  navigationIcon,
  editIcon,
  weatherIconMap,
  weekendIconMap,
  holidayIconMap,
  holidaysIconMap
};
