import { createFinanceTemplate } from "../template/template-creator";
import RBPsource from "../../../data/source";
import API_ENDPOINT from "../../../config/config";
import { updateRotiStock } from "../../utils/finance/rotiStockUpdater"; // Import the new function
import {
  displayFinance,
  displayUpcomingEvent,
} from "../../utils/finance/financialDisplayer";
import { callDataShell, logDatesSince } from "../../utils/syncData";
import { getCurrentDate } from "../../utils/datePicker";
import { checkUserRole } from "../../utils/interceptor";
import Swal from "sweetalert2";
import { closeModal, showModal } from "../../utils/sales/modal-handler";
import { allFinanceDataByDate } from "../../../data/allData";
const Finance = {
  async render() {
    const currentDate = new Date().toLocaleDateString(); // Get current date only
    return `
      <div class="content">
        <div class="loading" style="display: none;">Loading...</div> <!-- Elemen loading -->
        <div id="finance-content">
          ${createFinanceTemplate(currentDate)}
        </div>
      </div>
    `;
  },

  async afterRender() {
    const token = localStorage.getItem("token");
    // Logika redirect untuk logout
    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    const isAllow = await checkUserRole();
    console.log("isallow", isAllow);
    if (!isAllow) {
      window.location.hash = "#/sales";
      Swal.fire({
        title: "Akses Ditolak!",
        text: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        icon: "error",
        confirmButtonText: "OK",
      }).then(() => {
        // Redirect ke halaman lain, misalnya halaman beranda
      });
      return; // Hentikan proses render
    }

    await displayUpcomingEvent();
    await callDataShell();
    await displayFinance();

    document
      .getElementById("liburRefresh")
      .addEventListener("click", async () => {
        const errorEventElement = document.querySelector(".liburError");
        const errorTextEventElement = document.querySelector(".liburError p");
        const errorBtnEventElement =
          document.querySelector(".liburError button");
        const loaderEventElement = document.querySelector("#liburLoader");
        loaderEventElement.style.display = "block";
        errorTextEventElement.style.display = "none";
        errorBtnEventElement.style.display = "none";
        errorEventElement.style.display = "none";
        setTimeout(() => {
          errorTextEventElement.style.display = "block";
          errorBtnEventElement.style.display = "block";
          loaderEventElement.style.display = "none";
        }, 5000);
        await displayUpcomingEvent();
      });

    //
    // Handler untuk input daftar belanja
    //

    // Ambil dan render bahan
    await this.renderIngredients();

    // Existing event listeners dan logic
    const checkboxes = document.querySelectorAll(".checkbox-input");
    const tableBody = document.getElementById("shoppingListTable");

    // Modifikasi existing logic untuk menggunakan data dinamis
    const itemData = await this.buildItemDataFromIngredients();

    // Storage to cache quantity values
    const quantityCache = {};
    let itemCount = 1;

    function updateShoppingListTable() {
      // Save current quantities to cache before clearing the table
      const quantityInputs = document.querySelectorAll(".quantity-input");
      quantityInputs.forEach((input) => {
        const id = input.id.replace("quantity-", "");
        quantityCache[id] = input.value;
      });

      // Clear the table first
      tableBody.innerHTML = "";
      itemCount = 1;

      // Check if any checkbox or radio button is selected
      const isAnySelected = Array.from(checkboxes).some(
        (checkbox) => checkbox.checked
      );

      // Show or hide the shopping list based on selection
      const shoppingListContainer = document.getElementById("shoppingList");
      if (isAnySelected) {
        shoppingListContainer.style.display = "block"; // Show the shopping list
        // Render the shopping list only if something is selected

        // Loop through all checkboxes
        checkboxes.forEach((checkbox) => {
          if (checkbox.checked) {
            const itemId = checkbox.id;
            const item = itemData[itemId];

            if (item) {
              // Create a new row for each selected item
              const newRow = document.createElement("tr");
              const defaultQuantity = item.name === "Roti" ? 15 : 1;
              const cachedQuantity = quantityCache[itemId] || defaultQuantity; // Use cached value or default to 1
              const totalPrice = item.price * cachedQuantity; // Calculate total price for the item

              newRow.innerHTML = `
                <td>${itemCount++}</td>
                <td>${item.name}</td>
                <td>Rp. ${item.price.toLocaleString("id-ID")}</td>
                <td><input type="number" value="${cachedQuantity}" min="1" id="quantity-${itemId}" class="quantity-input"></td>
                <td>Rp. ${totalPrice.toLocaleString("id-ID")}</td>
                <td>
                  <div class="radio-input">
                    <label>
                      <input value="cash" name="payment-${itemId}" id="cash" type="radio" checked/>
                      <span>Cash</span>
                    </label>
                    <label>
                      <input value="debit" name="payment-${itemId}" id="debit" type="radio" />
                      <span>Debit</span>
                    </label>
                    <span class="selection"></span>
                  </div>
                </td> 
              `;

              // Add event listener to update total price when quantity changes
              const quantityInput = newRow.querySelector(`#quantity-${itemId}`);
              quantityInput.addEventListener("input", (event) => {
                const newQuantity = parseInt(event.target.value, 10) || 0; // Get new quantity
                const updatedTotalPrice = item.price * newQuantity; // Calculate new total price
                newRow.querySelector(
                  "td:nth-child(5)"
                ).textContent = `Rp. ${updatedTotalPrice.toLocaleString(
                  "id-ID"
                )}`; // Update total price cell
              });

              tableBody.appendChild(newRow);
            }
          }
        });
      } else {
        shoppingListContainer.style.display = "none"; // Hide the shopping list
        // If no checkbox or radio button is selected, clear the shopping list
        tableBody.innerHTML =
          "<tr><td colspan='5'>No items selected.</td></tr>";
      }
    }

    // Add event listener to all checkboxes
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", updateShoppingListTable);
    });

    // Add event listener to radio buttons
    const radioButtons = document.querySelectorAll('input[name="option"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener("change", updateShoppingListTable);
    });

    // Initial table rendering
    updateShoppingListTable();

    //
    // INPUT DATA BELANJA
    //

    document
      .getElementById("submit-button")
      .addEventListener("click", async () => {
        const selectedDate = document.querySelector("#dataDatePicker").value;
        const shoppingTableRows = document.querySelectorAll(
          "#shoppingListTable tr"
        );
        const newItems = [];

        // Collect new items from the table
        shoppingTableRows.forEach((row) => {
          const namaBahan = row.querySelector("td:nth-child(2)").textContent;
          const jumlah = parseInt(
            row.querySelector("td:nth-child(4) input").value,
            10
          );
          const hargaPerItem = parseInt(
            row
              .querySelector("td:nth-child(3)")
              .textContent.replace("Rp. ", "")
              .replace(".", ""),
            10
          );
          const totalHarga = hargaPerItem * jumlah;

          // Dapatkan metode pembayaran
          const paymentRadios = row.querySelectorAll('input[name^="payment-"]');
          const payment = Array.from(paymentRadios).find(
            (radio) => radio.checked
          ).value;

          newItems.push({
            namaBahan,
            jumlah,
            harga: hargaPerItem,
            totalHarga,
            payment, // Tambahkan metode pembayaran
          });
        });

        // Proses penggabungan item dengan nama yang sama dan metode pembayaran yang berbeda
        const mergedItems = {};
        newItems.forEach((item) => {
          const key = `${item.namaBahan}-${item.payment}`; // Buat key unik berdasarkan nama bahan dan metode pembayaran
          if (mergedItems[key]) {
            // Jika sudah ada, tambahkan jumlah dan totalHarga
            mergedItems[key].jumlah += item.jumlah;
            mergedItems[key].totalHarga += item.totalHarga;
          } else {
            // Jika belum ada, masukkan item baru
            mergedItems[key] = { ...item };
          }
        });

        // Ubah mergedItems ke array
        const finalItems = Object.values(mergedItems);

        // Hitung total cash dan debit
        const totalCash = finalItems
          .filter((item) => item.payment === "cash")
          .reduce((total, item) => total + item.totalHarga, 0);

        const totalDebit = finalItems
          .filter((item) => item.payment === "debit")
          .reduce((total, item) => total + item.totalHarga, 0);

        const totalBelanja = totalCash + totalDebit;

        const currentDateData = await getCurrentDateData(selectedDate);
        console.log("current date data:", currentDateData);

        if (currentDateData) {
          // Perform a PUT request to update the existing entry
          const updatedItems = [...currentDateData.barang]; // Copy existing items

          newItems.forEach((newItem) => {
            const existingItem = updatedItems.find(
              (item) => item.namaBahan === newItem.namaBahan
            );
            if (existingItem) {
              // Update quantity and price for existing items
              existingItem.jumlah += newItem.jumlah; // Update quantity
              existingItem.harga = newItem.harga; // Update unit price
              existingItem.totalHarga =
                existingItem.harga * existingItem.jumlah; // Recalculate total price
            } else {
              // Tambahkan item baru jika belum ada
              updatedItems.push(newItem); // Tambahkan item baru ke array
            }
          });
          try {
            await fetch(
              `${API_ENDPOINT.DAFTARBELANJA}/${currentDateData._id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  tanggal: selectedDate,
                  barang: updatedItems, // Update barang yang baru
                  totalBelanja: totalBelanja, // Gunakan total belanja terbaru
                }),
              }
            );
            tableBody.innerHTML = "";

            // Call the new function to update Roti stock
            await logDatesSince(getCurrentDate().pickedDate);

            await updateRotiStock();
            setTodayDate();

            console.log("Data updated successfully");
          } catch (error) {
            console.error("Error updating data:", error);
          }
        } else {
          // Create new entry
          await fetch(API_ENDPOINT.DAFTARBELANJA, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tanggal: selectedDate,
              barang: newItems, // Ensure this matches the expected structure
              totalBelanja: totalBelanja, // Gunakan total belanja terbaru
              totalCash: totalCash,
              totalDebit: totalDebit,
            }),
          });
          tableBody.innerHTML = "";

          // Call the new function to update Roti stock
          await logDatesSince(getCurrentDate().pickedDate);
          await updateRotiStock();
          setTodayDate();
          console.log("New data added successfully");
        }

        // Uncheck all checkboxes and radio buttons
        checkboxes.forEach((checkbox) => {
          checkbox.checked = false; // Uncheck checkbox
        });

        radioButtons.forEach((radio) => {
          radio.checked = false; // Uncheck radio button
        });

        // Clear quantity cache
        Object.keys(quantityCache).forEach((key) => {
          delete quantityCache[key]; // Remove each cached quantity
        });

        // Check if any checkbox or radio button is selected after submit
        const isAnySelected =
          Array.from(checkboxes).some((checkbox) => checkbox.checked) ||
          Array.from(radioButtons).some((radio) => radio.checked);
        const shoppingListContainer = document.getElementById("shoppingList");
        if (!isAnySelected) {
          shoppingListContainer.style.display = "none"; // Hide the shopping list if nothing is selected
          tableBody.innerHTML =
            "<tr><td colspan='5'>No items selected.</td></tr>"; // Show no items message
        }
      });

    //
    // Date Picker & Show data
    //

    // Function to format the date and set it as the value of the date picker
    async function setDatePickerValue(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // months are zero-based
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      document.getElementById("dataDatePicker").value = formattedDate;

      // Filter and display data based on the selected date
      await filterDataByDate(formattedDate);
    }

    function setTodayDate() {
      const today = new Date();
      setDatePickerValue(today);
    }

    // Function to handle the date increment or decrement
    function changeDate(days) {
      const datePicker = document.getElementById("dataDatePicker");
      let selectedDate = new Date(datePicker.value);

      // If no date is selected (empty), set it to today
      if (isNaN(selectedDate)) {
        selectedDate = new Date();
      }

      // Increment or decrement the date
      selectedDate.setDate(selectedDate.getDate() + days);

      // Update the date picker with the new date
      setDatePickerValue(selectedDate);
    }

    // Function to filter data by selected date
    async function filterDataByDate(selectedDate) {
      // Get the full list of data from RBPsource
      const daftarBelanja = await RBPsource.getDaftarBelanja();

      // Filter data based on the selected date
      const filteredData = daftarBelanja.filter(
        (entry) => entry.tanggal === selectedDate
      );

      // console.log(`Data for date ${selectedDate}:`, filteredData);

      // Display the filtered data in the template
      displayData(filteredData);
    }

    //
    // Event listeners for the buttons
    document
      .getElementById("incrementDate")
      .addEventListener("click", function () {
        changeDate(1); // Increment by 1 day
      });

    document
      .getElementById("decrementDate")
      .addEventListener("click", function () {
        changeDate(-1); // Decrement by 1 day
      });

    // Event listener for manual changes on the date picker input
    document
      .getElementById("dataDatePicker")
      .addEventListener("input", function (event) {
        const newDate = event.target.value;
        console.log(`Manual date change: ${newDate}`);
        filterDataByDate(newDate); // Filter data based on the selected date
      });

    document.querySelectorAll(".fas.fa-credit-card").forEach((element) => {
      element.addEventListener("click", () => {
        console.log('Element with class "fas fa-credit-card" clicked');
        this.switchFinanceModalModal();
      });
    });

    document.querySelectorAll(".fas.fa-wallet").forEach((element) => {
      element.addEventListener("click", () => {
        console.log('Element with class "fas fa-wallet" clicked');
        this.switchFinanceModalModal();
      });
    });

    // Initialize with today's date on page load
    async function getCurrentDateData(selectedDate) {
      // Fetch existing data for the selected date
      const existingData = await RBPsource.getDaftarBelanja();
      return existingData.find((data) => data.tanggal === selectedDate);
    }

    // Function to display the filtered data in the HTML template
    async function displayData(data) {
      // console.log("data", data);
      const tableContainer = document.querySelector("#ShoppingList");
      tableContainer.innerHTML = ""; // Clear previous data

      if (data.length === 0) {
        tableContainer.innerHTML = `<span class="noData">Tidak ada data untuk hari ini.</span>`;
        return;
      }

      // Create a table to display the data
      const table = document.createElement("table");
      table.id = "shoppingHistoryTable";
      table.classList.add("shoppingTable");
      table.innerHTML = `
    <thead class="tableHead">
      <tr>
        <th width="3%">No</th>
        <th>Nama Bahan</th>
        <th>Jumlah</th>
        <th>Harga</th>
        <th>Total Harga</th>
        <th>Pembayaran</th> <!-- New Payment Column -->
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="">
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" style="font-weight: bold; text-align: left;">Total Pengeluaran Tunai</td>
        <td colspan="3" id="totalBelanjaCash" style="font-weight: bold;">Rp. 0</td>
      </tr>
      <tr>
        <td colspan="4" style="font-weight: bold; text-align: left;">Total Pengeluaran Kredit</td>
        <td colspan="3" id="totalBelanjaDebit" style="font-weight: bold;">Rp. 0</td>
      </tr>
      <tr>
        <td colspan="4" style="font-weight: bold; text-align: left;">Total Pengeluaran</td>
        <td colspan="3" id="totalBelanja" style="font-weight: bold;">Rp. 0</td>
      </tr>
    </tfoot>
  `;

      let rowNumber = 1;
      let totalBelanja = 0;
      let totalCash = 0;
      let totalDebit = 0;

      data.forEach((entry) => {
        entry.barang.forEach((item) => {
          console.log("iytem", item.namaBahan);
          const row = document.createElement("tr");
          row.setAttribute("data-id", item._id);

          // Tambahkan radio button untuk pembayaran
          const paymentRadioHtml = `
        
        <div class="radio-input">
          <label>
            <input value="cash" name="payment-${item._id}" type="radio" ${
            item.payment === "cash" ? "checked" : ""
          }/>
            <span>Cash</span>
          </label>
          <label>
            <input value="debit" name="payment-${item._id}" type="radio" ${
            item.payment === "debit" ? "checked" : ""
          }/>
            <span>Debit</span>
          </label>
          <span class="selection"></span>
        </div>
      `;

          row.innerHTML = `
        <td>${rowNumber}</td>
        <td>${item.namaBahan}</td>
        <td contenteditable="true" onkeypress="return event.charCode >= 48 && event.charCode <= 57;">${
          item.jumlah
        }</td>
        <td>Rp. ${item.harga.toLocaleString("id-ID")}</td>
        <td>Rp. ${item.totalHarga.toLocaleString("id-ID")}</td>
        <td>${paymentRadioHtml}</td>
        <td>
          <div class="actions">
              <div class="button delete" data-nama="${item.namaBahan}">
                  <i class="fas fa-trash-alt"></i>
                  <span>Delete</span>
              </div>
          </div>
        </td>
      `;

          rowNumber++;
          table.querySelector("tbody").appendChild(row);

          totalBelanja += item.totalHarga;

          // Hitung total berdasarkan metode pembayaran
          if (item.payment === "cash") {
            totalCash += item.totalHarga;
          } else if (item.payment === "debit") {
            totalDebit += item.totalHarga;
          }
        });
      });

      // Update total di footer
      table.querySelector(
        "#totalBelanja"
      ).textContent = `Rp. ${totalBelanja.toLocaleString("id-ID")}`;
      table.querySelector(
        "#totalBelanjaDebit"
      ).textContent = `Rp. ${totalDebit.toLocaleString("id-ID")}`;
      table.querySelector(
        "#totalBelanjaCash"
      ).textContent = `Rp. ${totalCash.toLocaleString("id-ID")}`;

      tableContainer.appendChild(table);

      // Fungsi untuk memperbarui metode pembayaran dan mengambil data
      async function updatePaymentMethod(selectedDate, itemId, payment) {
        try {
          const existingData = await RBPsource.getDaftarBelanja();
          const currentDateData = existingData.find(
            (data) => data.tanggal === selectedDate
          );

          if (!currentDateData) {
            console.error("No data found for the selected date.");
            return;
          }

          // Update item dengan metode pembayaran baru
          const updatedItems = currentDateData.barang.map((item) => {
            if (item._id === itemId) {
              return { ...item, payment };
            }
            return item;
          });

          // Hitung ulang total cash dan debit
          const totalCash = updatedItems
            .filter((item) => item.payment === "cash")
            .reduce((total, item) => total + item.totalHarga, 0);
          console.log("totalCash", totalCash);

          const totalDebit = updatedItems
            .filter((item) => item.payment === "debit")
            .reduce((total, item) => total + item.totalHarga, 0);
          console.log("totalDebit", totalDebit);

          const totalBelanja = totalCash + totalDebit;

          // Kirim update ke server
          const response = await fetch(
            `${API_ENDPOINT.DAFTARBELANJA}/${currentDateData._id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                tanggal: selectedDate,
                barang: updatedItems,
                totalCash,
                totalDebit,
                totalBelanja,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update payment method");
          }

          await logDatesSince(getCurrentDate().pickedDate);
          await displayFinance();
          setTodayDate();
        } catch (error) {
          console.error("Error updating payment method:", error);
        }
      }

      const paymentRadios = document.querySelectorAll(
        'input[name^="payment-"]'
      );
      paymentRadios.forEach((radio) => {
        radio.addEventListener("change", async (event) => {
          const selectedDate = document.querySelector("#dataDatePicker").value;
          const row = event.target.closest("tr");
          const itemId = row.getAttribute("data-id");
          const payment = event.target.value;

          // Panggil fungsi untuk memperbarui metode pembayaran
          await updatePaymentMethod(selectedDate, itemId, payment);
        });
      });

      //
      // EDIT HISTORI BELANJA
      //

      document
        .querySelectorAll('td[contenteditable="true"]')
        .forEach((cell) => {
          cell.addEventListener("focus", (event) => {
            console.log("Cell is focused:", event.target.textContent);
          });

          cell.addEventListener("blur", async (event) => {
            const updatedValue = parseFloat(event.target.textContent);
            const selectedDate =
              document.querySelector("#dataDatePicker").value;
            const newDaftarBelanja = await RBPsource.getDaftarBelanja();
            const currentDateData = newDaftarBelanja.find(
              (data) => data.tanggal === selectedDate
            );

            if (!currentDateData) {
              console.error("No data found for the selected date.");
              return;
            }

            const row = event.target.closest("tr");
            const itemName = row.cells[1]?.textContent;
            const paymentRadio = row.querySelector(
              'input[name^="payment-"]:checked'
            );
            const payment = paymentRadio ? paymentRadio.value : "cash";

            if (!itemName) {
              console.error("No item name found in the selected row.");
              return;
            }

            // Update hanya item yang ditarget dan hitung ulang total
            const updatedItems = currentDateData.barang.map((item) => {
              if (item.namaBahan === itemName) {
                const newTotalPrice = item.harga * updatedValue;
                return {
                  ...item,
                  jumlah: updatedValue,
                  totalHarga: newTotalPrice,
                  payment: payment, // Tambahkan metode pembayaran
                };
              }
              return item;
            });

            // Hitung total cash, debit, dan total belanja
            const totalCash = updatedItems
              .filter((item) => item.payment === "cash")
              .reduce((total, item) => total + item.totalHarga, 0);

            const totalDebit = updatedItems
              .filter((item) => item.payment === "debit")
              .reduce((total, item) => total + item.totalHarga, 0);

            const updatedTotalBelanja = totalCash + totalDebit;

            // Tampilkan elemen loading
            const loadingElement = document.querySelector(".loading");
            loadingElement.style.display = "block";

            try {
              await updateShoppingListData(
                currentDateData._id,
                selectedDate,
                updatedItems,
                updatedTotalBelanja
              );
              console.log("Data updated successfully.");
            } catch (error) {
              console.error("Error updating data:", error);
            } finally {
              // Sembunyikan elemen loading setelah proses selesai
              loadingElement.style.display = "none";
            }
          });
        });

      // Di dalam fungsi yang menangani update data belanja
      async function updateShoppingListData(
        _id,
        selectedDate,
        updatedItems,
        totalBelanja
      ) {
        try {
          const loadingElement = document.querySelector(".loading");
          loadingElement.style.display = "block";

          // Hitung total cash dan debit
          const totalCash = updatedItems
            .filter((item) => item.payment === "cash")
            .reduce((total, item) => total + item.totalHarga, 0);

          const totalDebit = updatedItems
            .filter((item) => item.payment === "debit")
            .reduce((total, item) => total + item.totalHarga, 0);

          // Update daftar belanja
          const response = await fetch(`${API_ENDPOINT.DAFTARBELANJA}/${_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tanggal: selectedDate,
              barang: updatedItems,
              totalBelanja: totalBelanja,
              totalCash: totalCash,
              totalDebit: totalDebit,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to update data on server.");
          }

          const data = await response.json();

          // Validasi data
          if (data && data.barang && data.totalBelanja !== totalBelanja) {
            throw new Error("Data tidak sesuai dengan yang diharapkan.");
          }

          console.log("Data updated successfully:", data);

          await logDatesSince(getCurrentDate().pickedDate);

          await updateRotiStock();
          setTodayDate();
        } catch (error) {
          console.error("Error updating shopping list data:", error);
          // Tampilkan pesan error ke pengguna
          alert("Terjadi kesalahan saat mengupdate data");
        } finally {
          const loadingElement = document.querySelector(".loading");
          loadingElement.style.display = "none";
        }
      }

      // updateRotiStock();

      //
      // DELETE HISTORI BELANJA
      //

      const deleteButtons = document.querySelectorAll(".button.delete");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
          const buttonElement = event.target.closest(".button.delete");
          const namaBahan = buttonElement.getAttribute("data-nama");

          // Atau tambahkan pengecekan
          if (!namaBahan) {
            console.error("Nama bahan tidak ditemukan");
            return;
          }
          const { default: swal } = await import("sweetalert2");
          const confirmDelete = await swal.fire({
            title: "Konfirmasi Hapus",
            text: `Apakah Anda yakin ingin menghapus ${namaBahan}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
          });

          if (confirmDelete.isConfirmed) {
            try {
              const itemId = event.target.closest("tr").getAttribute("data-id");
              const selectedDate =
                document.querySelector("#dataDatePicker").value;

              const response = await fetch(
                `${API_ENDPOINT.DAFTARBELANJA}/${selectedDate}/${itemId}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error(
                  `Gagal menghapus bahan ${namaBahan}. id: ${itemId}`
                );
              }

              // Refresh data setelah penghapusan
              const existingData = await RBPsource.getDaftarBelanja();
              const currentDateData = existingData.find(
                (data) => data.tanggal === selectedDate
              );

              if (currentDateData) {
                // Hitung ulang total cash, debit, dan total belanja
                const updatedItems = currentDateData.barang.filter(
                  (item) => item._id !== itemId
                );

                const totalCash = updatedItems
                  .filter((item) => item.payment === "cash")
                  .reduce((total, item) => total + item.totalHarga, 0);

                const totalDebit = updatedItems
                  .filter((item) => item.payment === "debit")
                  .reduce((total, item) => total + item.totalHarga, 0);

                const newTotalBelanja = totalCash + totalDebit;

                // Update database dengan total baru
                await fetch(
                  `${API_ENDPOINT.DAFTARBELANJA}/${currentDateData._id}`,
                  {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      tanggal: selectedDate,
                      barang: updatedItems,
                      totalCash: totalCash,
                      totalDebit: totalDebit,
                      totalBelanja: newTotalBelanja,
                    }),
                  }
                );

                // Update total yang ditampilkan di UI
                document.querySelector(
                  "#totalBelanja"
                ).textContent = `Rp. ${newTotalBelanja.toLocaleString(
                  "id-ID"
                )}`;
              }

              await logDatesSince(getCurrentDate().pickedDate);
              await updateRotiStock();
              setTodayDate();
              console.log(`Bahan ${namaBahan} berhasil dihapus.`);
            } catch (error) {
              console.error("Error deleting item:", error);
            }
          }
        });
      });
    }

    setTodayDate();
  },

  async renderIngredients() {
    try {
      // Ambil data bahan dari sumber data
      const ingredients = await RBPsource.getDataBahan();

      // Kelompokkan bahan berdasarkan kategori
      const categorizedIngredients = ingredients.reduce((acc, ingredient) => {
        if (!acc[ingredient.kategori]) {
          acc[ingredient.kategori] = [];
        }
        acc[ingredient.kategori].push(ingredient);
        return acc;
      }, {});

      // Render kategori dan bahan
      const containerShopping = document.querySelector(".containerShopping");

      Object.entries(categorizedIngredients).forEach(([category, items]) => {
        const categorySection = document.createElement("div");
        categorySection.innerHTML = `<p id="purchase_Name">${category}</p>`;

        const itemContainer = document.createElement("div");
        itemContainer.className = "shoppingItemQuantity";

        items.forEach((item) => {
          const itemDiv = document.createElement("div");
          itemDiv.className = "itemCheckbox";
          itemDiv.innerHTML = `
            <input
              type="checkbox"
              id="${item._id}-checkbox"
              class="checkbox-input"
              data-name="${item.namaBahan}"
              data-price="${item.harga}"
            />
            <label 
              for="${item._id}-checkbox" 
              class="checkbox-label" 
              id="${item._id}-label"
            >
              ${item.namaBahan}
            </label>
          `;

          itemContainer.appendChild(itemDiv);
        });

        categorySection.appendChild(itemContainer);
        containerShopping.insertBefore(
          categorySection,
          containerShopping.querySelector("#shoppingList")
        );
      });
    } catch (error) {
      console.error("Error rendering ingredients:", error);
    }
  },

  async buildItemDataFromIngredients() {
    try {
      const ingredients = await RBPsource.getDataBahan();

      // Konversi data bahan menjadi format yang kompatibel dengan existing logic
      return ingredients.reduce((acc, item) => {
        acc[`${item._id}-checkbox`] = {
          name: item.namaBahan,
          price: item.harga,
        };
        return acc;
      }, {});
    } catch (error) {
      console.error("Error building item data:", error);
      return {};
    }
  },

  async switchFinanceModalModal() {
    const currDate = getCurrentDate().pickedDate;
    const cashValue = (await allFinanceDataByDate(currDate)).totalCash;
    const debitValue = (await allFinanceDataByDate(currDate)).totalDebit;
    const modalContent = `
    <div class="modal-content" id="manualSyncModal">
      <span class="close">&times;</span>
      <h2>Switch Saldo Kas</h2>
      <form id="switchFinancial">
        <div class="form-group">
          <div class="financialSwitchHead">
            <div>
              <label for="cashFinance">Saldo tunai</label>
              <input type="text" id="cashFinance" name="cashFinance" disabled value="Rp ${cashValue
                .toLocaleString()
                .replace(/,/g, ".")}"/>
            </div>
            <div>
              <i class="fas fa-arrow-right" id="arrowSwitchFinance"></i>
            </div>
            <div>
              <label for="switch">Saldo non-tunai</label>
              <input type="text" id="switch" name="switch" disabled value="Rp ${debitValue
                .toLocaleString()
                .replace(/,/g, ".")}"/>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="switchValue">Nilai Tukar</label>
          <input type="number" id="switchValue" name="switchValue" required/>
        </div>
        
        <div class="form-group">
          <div class="financialSwitchFooter">
            <div>
              <i class="fas fa-sync" id="switchFinance-btn"></i>            
            </div>
            <div>
              <button type="submit">Sinkronkan Data</button>
            </div>
          </div>
        </div> 
      </form>
    </div>
    `;

    // Tampilkan modal dengan konten
    const modal = showModal(modalContent);

    document
      .getElementById("switchFinance-btn")
      .addEventListener("click", () => {
        let switchToWhere;
        const arrowIcon = document.getElementById("arrowSwitchFinance");
        if (arrowIcon.classList.contains("rotate")) {
          arrowIcon.classList.remove("rotate");
          arrowIcon.classList.add("reset");
          switchToWhere = "toCash";
        } else {
          arrowIcon.classList.remove("reset");
          arrowIcon.classList.add("rotate");
          switchToWhere = "toDebit";
        }
        console.log(switchToWhere);
      });

    document
      .getElementById("switchFinancial")
      .addEventListener("submit", (e) => {
        e.preventDefault();
      });

    // Tambahkan event listener untuk menutup modal
    modal.querySelector(".close").addEventListener("click", () => {
      modal.style.display = "none";
    });
  },
};

export default Finance;
