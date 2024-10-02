const createSalesTemplate = () => `
  <div class="status-container">
        <div class="status-item">
          <div class="status-text">Terjual : 6/14</div>
        </div>
        <div class="status-item">
          <div class="status-text">Penjualan : Rp.123.000</div>
        </div>
  </div>

  <div class="purchase-form">
    <form>
      <h2 class="form-input-penjualan">Input Pesanan</h2>
      <div class="form-group">
        <label for="tipe">Harga</label>
        <select id="tipe" name="tipe">
          <option value="17000">Satu Rasa</option>
          <option value="20000">Dua Rasa</option>
          <option value="23000">Mix 2 Rasa</option>
        </select>
      </div>

      <div class="form-group">
        <label for="quantity">Jumlah</label>
        <input type="number" id="quantity" name="quantity" min="1" value="1"/>
      </div>

      <div class="form-group">
        <label for="purchase-type-select">Pembelian Melalui:</label>
        <select id="purchase-type-select" name="purchase_type">
          <option value="outlet">Outlet</option>
          <option value="merchant">Merchant</option>
        </select>
      </div>

      <div class="form-group">
        <button type="submit">Simpan</button>
      </div>
    </form>
  </div>

  <table class="table-sales-today">
    <thead>
      <tr>
        <th>Waktu</th>
        <th>Harga</th>
        <th>Jumlah</th>
        <th>Lokasi</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <!-- Data Penjualan akan di-populate di sini -->
    </tbody>
  </table>
`;

export { createSalesTemplate };
