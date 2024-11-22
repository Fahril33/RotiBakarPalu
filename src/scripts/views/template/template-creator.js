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
          <h2 id="soldCount"></h2>
        </div>
        <div class="itemPenjualan">
          <img id="imgPredict" alt="soldIcon" />
          <h2 id="incomeCount"></h2>
        </div>
      </div>
      <div class="hasilPrediksi">
        <h3 id="todayPredictionResult">Data Kosong</h3>
        <button id="editPrediction"><img class="editBtnImg" alt="editIcon"></button>
      </div>
      <div class="dataInfo">
      <div class="cuaca">
          <h4>Cuca Hari Ini</h4>
          <img id="imgCuaca" alt="weatherIcon" />
          <div class="textInfo">
            <h5 id="todayWeather"></h5>
          </div>
        </div>
        <div class="cuaca">
          <h4>Cuca Besok</h4>
          <img id="imgCuaca" alt="tomorowWeatherIcon" />
          <div class="textInfo">
            <h5 id="tomorrowWeather"></h5>
          </div>
        </div>
        <div class="weekend">
          <h4>Weekend</h4>
          <img id="imgDays" alt="weekendIcon" />
          <div class="textInfo">
            <h5 id="weekend"></h5>
          </div>
        </div>
        <div class="event">
          <h4>Event/Hari Raya</h4>
          <img id="imgDays" alt="eventIcon" />
          <div class="textInfo">
            <h5 id="rayaEvent"></h5>
          </div>
        </div>
      </div>
    </div>
  </div> 

  <div class="card">
    <div class="daftarBelanja">
      <h2>Histori Penjualan</h2>
      <div class="datePickerContainer">
        <button id="decrementDate">◀</button>
        <input type="date" name="" id="dataDatePicker">
        <button id="incrementDate">▶</button>
      </div>
      <div class="tableSaleContainer" id="soldList">  
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
      </div>
    </div>
  </div>

  
`;

const createModalTemplate = ({ date, time, price, quantity, place }) => `
  <div class="modal-content">
  <span class="close">&times;</span>
  <h2>Update Data Penjualan</h2>
    <form>
      <div class="form-group">
        <label for="date">Tanggal</label>
        <input type="text" id="date" name="date" value="${date}" readonly>
      </div>
      <div class="form-group">
        <label for="time">Waktu</label>
        <input type="text" id="time" name="time" value="${time}" readonly>
      </div>
      <div class="form-group">
        <label for="price">Harga</label>
        <select id="price" name="price">
          <option value="17000" ${
            price === "17000" ? "selected" : ""
          }>Satu Rasa</option>
          <option value="20000" ${
            price === "20000" ? "selected" : ""
          }>Dua Rasa</option>
          <option value="23000" ${
            price === "23000" ? "selected" : ""
          }>Mix 2 Rasa</option>
        </select>
      </div>
      <div class="form-group">
        <label for="quantity">Jumlah</label>
        <input type="number" id="quantity" name="quantity" value="${quantity}" min="1">
      </div>
      <div class="form-group">
        <label for="place">Lokasi</label>
        <select id="place" name="place">
          <option value="outlet" ${
            place === "outlet" ? "selected" : ""
          }>Outlet</option>
          <option value="merchant" ${
            place === "merchant" ? "selected" : ""
          }>Merchant</option>
        </select>
      </div>
      <button type="submit">Update</button>
    </form>
  </div>
`;

const createFinanceTemplate = (datetime) => `
  <div class="dashboard-container">
    <div class="dashboard-header">
        <h1>Status Keuangan</h1>
    </div>
    <div class="dashboard-grid">
      <div>
        <div class="dashboard-card">
            <i class="fas fa-money-bill-wave"></i>
            <div class="details">
              <p class="value" id="TodayCash"></p>
              <p class="title">Saldo Tunai Hari Ini</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-credit-card"></i>
            <div class="details">
              <p class="value" id="todayCredit"></p>
              <p class="title">Saldo Kredit Hari Ini</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-wallet"></i>
            <div class="details">
              <p class="value" id="todayTotal"></p>
              <p class="title">Total Saldo Hari Ini</p>
            </div>
        </div>
      </div>
      <div>
        <div class="dashboard-card">
            <i class="fas fa-arrow-up"></i>
            <div class="details">
              <p class="value" id="incomeTM"></p>
              <p class="title">Pemasukan Bulan Ini</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-arrow-down"></i>
            <div class="details">
              <p class="value" id="expenseTM"></p>
              <p class="title">Pengeluaran Bulan Ini</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-chart-line"></i>
            <div class="details">
              <p class="value" id="profitTM"></p>
              <p class="title">Keuntungan Bulan Ini</p>
            </div>
        </div>
      </div>
    </div>
  </div>

  <!-- pembelian -->
  <div class="card">
    <div class="containerShopping">
      <h2> Show Warning, 3 Hari lagi ada EVENT/RAYA</h2> 
      <h2>Tambah Daftar Belanja ${datetime} (pertimbangkan hapus tgl ini)</h2>
      <p id="purchase_Name">Roti</p>
      <div class="shoppingItemQuantity">
        <div class="radioOption">
          <input type="radio" id="ambil" name="option" value="ambil" />
          <label for="ambil">ambil</label>
        </div>
        <div class="radioOption">
          <input
            type="radio"
            id="tidakAmbil"
            name="option"
            value="tidakAmbil"
          />
          <label for="tidakAmbil">tidak</label>
        </div>
      </div>

      <!--  -->
      <!-- BAHAN -->
      <!--  -->
      <p id="purchase_Name">Bahan</p>
      <div class="shoppingItemQuantity">
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="skmc-checkbox"
            class="checkbox-input"
          />
          <label for="skmc-checkbox" class="checkbox-label" id="skmc-label"
            >SKMC</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="skmp-checkbox"
            class="checkbox-input"
          />
          <label for="skmp-checkbox" class="checkbox-label" id="skmp-label"
            >SKMP</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="butter-checkbox"
            class="checkbox-input"
          />
          <label
            for="butter-checkbox"
            class="checkbox-label"
            id="butter-label"
            >Butter</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="keju-checkbox"
            class="checkbox-input"
          />
          <label for="keju-checkbox" class="checkbox-label" id="keju-label"
            >Keju</label
          >
        </div>
      </div>

      <!--  -->
      <!-- COKLAT -->
      <!--  -->
      <p id="purchase_Name">Coklat</p>
      <div class="shoppingItemQuantity">
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="pasta-checkbox"
            class="checkbox-input"
          />
          <label
            for="pasta-checkbox"
            class="checkbox-label"
            id="pasta-label"
            >Pasta</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="crispy-checkbox"
            class="checkbox-input"
          />
          <label
            for="bahan-checkbox2"
            class="checkbox-label"
            id="crispy-label"
            >Crispy</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="mesis-checkbox"
            class="checkbox-input"
          />
          <label
            for="mesis-checkbox"
            class="checkbox-label"
            id="mesis-label"
            >Mesis</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="oreo-checkbox"
            class="checkbox-input"
          />
          <label for="oreo-checkbox" class="checkbox-label" id="oreo-label"
            >Oreo</label
          >
        </div>
      </div>

      <!--  -->
      <!-- SELAI -->
      <!--  -->
      <p id="purchase_Name">Selai</p>
      <div class="shoppingItemQuantity" id="selai">
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="nanas-checkbox"
            class="checkbox-input"
          />
          <label
            for="nanas-checkbox"
            class="checkbox-label"
            id="nanas-label"
            >Nanas</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="strawberry-checkbox"
            class="checkbox-input"
          />
          <label
            for="strawberry-checkbox"
            class="checkbox-label"
            id="strawberry-label"
            >Strawberry</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="blueberry-checkbox"
            class="checkbox-input"
          />
          <label
            for="blueberry-checkbox"
            class="checkbox-label"
            id="blueberry-label"
            >Blueberry</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="vanilla-checkbox"
            class="checkbox-input"
          />
          <label
            for="vanilla-checkbox"
            class="checkbox-label"
            id="vanilla-label"
            >Vanilla</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="durian-checkbox"
            class="checkbox-input"
          />
          <label
            for="durian-checkbox"
            class="checkbox-label"
            id="durian-label"
            >Durian</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="sarikaya-checkbox"
            class="checkbox-input"
          />
          <label
            for="sarikaya-checkbox"
            class="checkbox-label"
            id="sarikaya-label"
            >Sarikaya</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="tiramisu-checkbox"
            class="checkbox-input"
          />
          <label
            for="tiramisu-checkbox"
            class="checkbox-label"
            id="tiramisu-label"
            >Tiramisu</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="taro-checkbox"
            class="checkbox-input"
          />
          <label for="taro-checkbox" class="checkbox-label" id="taro-label"
            >Taro</label
          >
        </div>
        <div class="itemCheckbox">
          <input
            type="checkbox"
            id="cappuchino-checkbox"
            class="checkbox-input"
          />
          <label
            for="cappuchino-checkbox"
            class="checkbox-label"
            id="cappuchino-label"
            >Cappuchino</label
          >
        </div>
      </div>
    </div>

    <div class="containerShopping" id="shoppingList">
      <h2>Daftar Belanja</h2>
      <div class="shoppingTableContainer">
        <table class="shoppingTable">
          <thead class"tableHead">
            <tr>
              <th width="">No</th>
              <th width="20%">Nama Bahan</th>
              <th width="20%">Harga Satuan</th>
              <th width="10%">Quantity</th>
              <th width="20%">Total Harga</th>
              <th width="170px">Pembayaran</th>
            </tr>
          </thead>
          <tbody id="shoppingListTable">

            <!-- Rows will be dynamically added here -->
            
          </tbody>
        </table>
      </div>
      <button id="submit-button" class="konfirmasi-button">Konfirmasi</button>
    </div>
  </div>

  <div class="card">
    <div class="daftarBelanja">
      <div class="daftarBelanja">
        <h2>Histori Belanja</h2>
        <div class="datePickerContainer">
          <button id="decrementDate">◀</button>
          <input type="date" name="" id="dataDatePicker">
          <button id="incrementDate">▶</button>
        </div>
        <div class="shoppingTableContainer" id="ShoppingList">
          
        </div>
      </div>
    </div>
  </div>
`;

const createShoppingRowTemplate = (item) => `
  <tr>
    <td>${item.no}</td>
    <td>${item.namaBahan}</td>
    <td>Rp. ${item.harga}</td>
    <td>${item.quantity}</td>
    <td>Rp. ${item.totalHarga}</td>
    <td>
      <div class="radioOption">
        <input type="radio" id="cash-${item.id}" name="payment-${
  item.id
}" value="cash" ${item.payment === "cash" ? "checked" : ""}>
        <label for="cash-${item.id}">Cash</label>
        <input type="radio" id="debit-${item.id}" name="payment-${
  item.id
}" value="debit" ${item.payment === "debit" ? "checked" : ""}>
        <label for="debit-${item.id}">Debit</label>
      </div>
    </td>
  </tr>
`;

export {
  createModalTemplate,
  createSalesTemplate,
  createFinanceTemplate,
  createShoppingRowTemplate,
};
