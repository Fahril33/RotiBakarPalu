const createSalesTemplate = () => `

  <div class="itemContainer">
    <div class="item-form-sales">
      <div class="purchase-form">
        <form>
          <h2 class="form-input-penjualan">Input Pesanan</h2>
          <div class="form-group">
            <label for="tipe">Menu</label>
            <select id="tipe" name="tipe">
              <option value="17000">Satu Rasa</option>
              <option value="20000">Dua Rasa</option>
              <option value="23000">Mix 2 Rasa</option>
            </select>
          </div>

          <div class="form-group">
            <label for="quantity">Jumlah</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value="1"
            />
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
    </div>
    <div class="item-predictions">
      <div class="salesInfo">
        <div class="itemPenjualan">
          <img id="imgPredict" alt="BagIcon" />
          <h2>Terjual 6/14</h2>
        </div>
        <div class="itemPenjualan">
          <img id="imgPredict" alt="soldIcon" />
          <h2>Penjualan : Rp. 124.000</h2>
        </div>
      </div>
      <div class="hasilPrediksi">
        <h2>Prediksi Penjualan hari ini : $hasilPrediksi</h2>
      </div>
      <div class="dataInfo">
        <div class="cuaca">
          <img id="imgCuaca" alt="weatherIcon" />
          <div class="textInfo">
            <h5>Cuaca Hari Ini Mendung</h5>
          </div>
        </div>
        <div class="cuaca">
          <img id="imgCuaca" alt="tomorowWeatherIcon" />
          <div class="textInfo">
            <h5>Cuaca Besok Cerah</h5>
          </div>
        </div>
        <div class="weekend">
          <img id="imgDays" alt="weekendIcon" />
          <div class="textInfo">
            <h5>Weekend</h5>
          </div>
        </div>
        <div class="event">
          <img id="imgDays" alt="eventIcon" />
          <div class="textInfo">
            <h5>Hari Raya Idul Fitri</h5>
          </div>
        </div>
      </div>
    </div>
  </div> 

  <table class="table-sales-today">
    <thead>
      <tr>
        <th>Tanggal</th>
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
