// src/utils/modal-handler.js
import SalesSource from "../../data/salesSource";
import TableHandler from "./table-handler";

const ModalHandler = {
  showEditModal(saleData, row) {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Update Data Penjualan</h2>
        <form>
          <div class="form-group">
            <label for="date">Tanggal</label>
            <input type="text" id="date" name="date" value="${
              saleData.date
            }" readonly>
          </div>
          <div class="form-group">
            <label for="time">Waktu</label>
            <input type="text" id="time" name="time" value="${
              saleData.time
            }" readonly>
          </div>
          <div class="form-group">
            <label for="price">Harga</label>
            <select id="price" name="price">
              <option value="17000" ${
                saleData.price === "17000" ? "selected" : ""
              }>Satu Rasa</option>
              <option value="20000" ${
                saleData.price === "20000" ? "selected" : ""
              }>Dua Rasa</option>
              <option value="23000" ${
                saleData.price === "23000" ? "selected" : ""
              }>Mix 2 Rasa</option>
            </select>
          </div>
          <div class="form-group">
            <label for="quantity">Jumlah</label>
            <input type="number" id="quantity" name="quantity" value="${
              saleData.quantity
            }" min="1">
          </div>
          <div class="form-group">
            <label for="place">Lokasi</label>
            <select id="place" name="place">
              <option value="outlet" ${
                saleData.place === "outlet" ? "selected" : ""
              }>Outlet</option>
              <option value="merchant" ${
                saleData.place === "merchant" ? "selected" : ""
              }>Merchant</option>
            </select>
          </div>
          <button type="submit">Update</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".close");
    closeButton.addEventListener("click", () => {
      modal.remove();
    });

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });

    const form = modal.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedData = {
        date: form.querySelector("#date").value,
        time: form.querySelector("#time").value,
        price: form.querySelector("#price").value,
        quantity: form.querySelector("#quantity").value,
        place: form.querySelector("#place").value,
      };

      try {
        const updatedSale = await SalesSource.updateSaleData(
          saleData.id,
          updatedData
        );
        row.innerHTML = `
          <td>${updatedSale.date}</td>
          <td>${updatedSale.time}</td>
          <td>${updatedData.price}</td>
          <td>${updatedData.quantity}</td>
          <td>${updatedData.place}</td>
          <td>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
          </td>
        `;
        modal.remove();
        TableHandler.attachTableEventListeners([updatedSale]);
      } catch (error) {
        console.error("Error updating sale:", error);
      }
    });
  },
};

export default ModalHandler;
