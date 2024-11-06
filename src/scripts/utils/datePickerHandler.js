import { getCurrentDate } from "./datePicker";
import RBPsource from "../../data/source";
import { displayerIncome, displayerSold } from "./sales/counterData";

export  function initializeDatePicker(salesInstance) {
  const currentDate = getCurrentDate();
  setDatePickerValue(currentDate.pickedDate, salesInstance);

  // Event listeners for the buttons
  document
    .getElementById("incrementDate")
    .addEventListener("click", () => changeDate(1, salesInstance));

  document
    .getElementById("decrementDate")
    .addEventListener("click", () => changeDate(-1, salesInstance));

  // Event listener for manual changes on the date picker input
  document
    .getElementById("dataDatePicker")
    .addEventListener("input", (event) => {
      const newDate = event.target.value;
      console.log(`Manual date change: ${newDate}`);
      filterDataByDate(newDate, salesInstance);
    });
}

function setDatePickerValue(date, salesInstance) {
  document.getElementById("dataDatePicker").value = date;
  filterDataByDate(date, salesInstance);
}

function changeDate(days, salesInstance) {
  const datePicker = document.getElementById("dataDatePicker");
  let selectedDate = new Date(datePicker.value);

  if (isNaN(selectedDate)) {
    selectedDate = new Date();
  }

  selectedDate.setDate(selectedDate.getDate() + days);
  setDatePickerValue(selectedDate.toISOString().split("T")[0], salesInstance);
}

async function filterDataByDate(selectedDate, salesInstance) {
  try {
    const sales = await RBPsource.salesData();
    const filteredData = sales.find((entry) => entry.date === selectedDate);

    console.log(`Data for date ${selectedDate}:`, filteredData);

    // Call populateSalesTable with the filtered data
    if (
      salesInstance &&
      typeof salesInstance.populateSalesTable === "function"
    ) {
      salesInstance.populateSalesTable(filteredData);
      displayerSold();
      displayerIncome();
    }
  } catch (error) {
    console.error("Error filtering data:", error);
  }
}
