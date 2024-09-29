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
              <option value="satu_rasa">17000</option>
              <option value="dua_rasa">20000</option>
              <option value="mix_2_rasa">23000</option>
            </select>
          </div>

          <div class="form-group">
            <div class="form-group">
              <label for="quantity">Jumlah</label>
              <input type="number" id="quantity" name="quantity" min="1" />
            </div>

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
            <th>ID</th>
            <th>Harga</th>
            <th>Jumlah</th>
            <th>Lokasi</th>
            <th>Action</th>
          </tr>
        </thead>
        
        <tbody>
          <tr>
            <td>1</td>
            <td>17000</td>
            <td>2</td>
            <td>Outlet</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
          <tr>
            <td>2</td>
            <td>20000</td>
            <td>3</td>
            <td>Merchant</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
          <tr>
            <td>3</td>
            <td>23000</td>
            <td>1</td>
            <td>Outlet</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
          <tr>
            <td>4</td>
            <td>17000</td>
            <td>4</td>
            <td>Merchant</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
          <tr>
            <td>5</td>
            <td>20000</td>
            <td>2</td>
            <td>Outlet</td>
            <td>
              <button class="edit-button">Edit</button>
              <button class="delete-button">Delete</button>
            </td>
          </tr>
          
        </tbody>
        
      </table>
`;

export {createSalesTemplate};