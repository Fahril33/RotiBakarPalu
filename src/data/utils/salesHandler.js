import Swal from "sweetalert2";
import API_ENDPOINT from "../../config/config";
import { allSalesDataByDate } from "../allData";

export async function PutSalesData(formattedDate, updatedData) {
  const isSalesShell = (await allSalesDataByDate(formattedDate)).isThere;
  if (isSalesShell === false) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: "error",
      title: `Mengabaikan ${formattedDate} (tutup)`,
    });
    return
  }
  try {
    const response = await fetch(
      `${API_ENDPOINT.SALES}/put/date/${formattedDate}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating sales data:", error);
    throw error;
  }
}
