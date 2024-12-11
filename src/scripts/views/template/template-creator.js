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
          <h4>Event/Raya</h4>
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
  <h2>Update Data Penjualan</h2>
  <span class="close">&times;</span>
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
      <div class="form-group">
        <button type="submit">Update</button>
      </div>
    </form>
  </div>
`;

const createFinanceTemplate = () => `
  <div class="dashboard-container">
    <div class="dashboard-grid">
      <div class="dashboard-child-1">
        <div class="dashboard-card">
            <i class="fas fa-money-bill-wave"></i>
            <div class="details">
              <p class="value" id="TodayCash"></p>
              <p class="title">Saldo Tunai</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-credit-card"></i>
            <div class="details">
              <p class="value" id="todayCredit"></p>
              <p class="title">Saldo Kredit</p>
            </div>
        </div>
        <div class="dashboard-card">
            <i class="fas fa-wallet"></i>
            <div class="details">
              <p class="value" id="todayTotal"></p>
              <p class="title">Total Saldo</p>
            </div>
        </div>
      </div>
      <div class="dashboard-child-2">
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
      <div class="dashboard-child-3">
        <div class="dashboard-card">
          <div class="details">
            <p class="valueEventRaya">Event/Raya Mendatang</p>
            <div class="activity-container">
              
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="dashboard-grid">
      
    </div>
  </div>

  <!-- pembelian -->
  <div class="card">
    <div class="containerShopping">
      <h2>Tambah Daftar Belanja</h2>
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

const createHomeTemplate = () => `
    <div class="overview-bar">
      <p>Rincian</p>
      <div class="overview-navigator">
        <a href="#stocks-charts">Stok</a>
        <a href="#finance-charts">Keuangan</a>
        <a href="#financialFlow-charts">Arus Kas</a>
      </div>
    </div>

    <div class="home-content">
      <div class="section-overview">
        <div class="card financial">
          <span>Total Saldo</span><br>
          <p4 id="total-cash">Memuat..</p4>
          <div class="tooltip">
            <span class="tooltiptext">
              <p id="cash">Memuat saldo cash..</p>
              <p id="debit">Memuat saldo kredit..</p>
            </span>
            <i class="fas fa-circle-info"></i>
          </div><br>
          <div class="tooltip">
            <span class="tooltiptext" id="totalCashTootltip">
              <div class="profit-icon" id="tweekCashStatus">
                <i class="fas fa-arrow-up" id="arrUp" style="display: none;"><span>0%</span></i>
                <i class="fas fa-arrow-down" id="arrDown" style="display: none;"><span>0%</span></i>
                <span> dari minggu lalu</span>
              </div>
              <div class="profit-icon" id="tmonthCashStatus">
                <i class="fas fa-arrow-up" id="arrUp" style="display: none;"><span>0%</span></i>
                <i class="fas fa-arrow-down" id="arrDown" style="display: none;"><span>0%</span></i>
                <span> dari bulan lalu</span>
              </div>
            </span>
            <div class="profit-icon" id="todayCashStatus">
              <i class="fas fa-arrow-up" id="arrUp" style="display: none;"><span>0%</span></i>
              <i class="fas fa-arrow-down" id="arrDown" style="display: none;"><span>0%</span></i>
              <span> berdasarkan kemarin</span>
            </div>
          </div>
        </div>
        <div class="card financial">
          <span>Keuntungan bulan ini</span><br>
          <p4 id="total-profit">Memuat..</p4>
          <div class="tooltip">
            <span class="tooltiptext">
              <p id="profitText">Bulan ini :</p>
              <p id="currIncome">Memuat data pemasukan..</p>
              <p id="currExpense">Memuat data pengeluaran..</p>
              <p id="profitText">Bulan sebelumnya :</p>
              <p id="prevIncome">Memuat data pemasukan..</p>
              <p id="prevExpense">Memuat data pengeluaran..</p>
            </span>
            <i class="fas fa-circle-info"></i>
          </div>
          <div class="profit-icon" id="todayProfitStatus">
            <i class="fas fa-arrow-up" id="arrUp"><span>12,69%</span></i>
            <i class="fas fa-arrow-down" id="arrDown"><span>12,69%</span></i>
            <span> berdasarkan bulan lalu</span>
          </div>
        </div>
        <div class="card financial" id="breadStockCard">
          <span>Stok bulan ini</span>
          <div class="financial-bread">
            <div class="profit-icon" id="soldStockStatus">
              <p4 id="sold-stocks">Memuat..</p4><br>
              <i class="fas fa-arrow-up" id="arrUp"><span>4</span></i>
              <i class="fas fa-arrow-down" id="arrDown"><span>3</span></i>
              <span> dari bulan lalu</span>
            </div>
            <div class="profit-icon" id="spoiledStockStatus">
              <p4 id="spoiled-stocks">Memuat..</p4><br>
              <i class="fas fa-arrow-up" id="arrUp"><span>3</span></i>
              <i class="fas fa-arrow-down" id="arrDown"><span>2</span></i>
              <span> dari bulan lalu</span>
            </div>
          </div>
        </div>
      </div>
      <div class="section-charts">
        <div class="card stocks-charts" id="stocks-charts">
          <div class="chart-headers" >
            <p4>Historis Stok</p4>
            <div class="filters">
              <i class="fas fa-filter mr-2"></i>
              <select name="stocks-filter" id="stocks-filter">
                <option value="daily" selected>Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <!-- <option value="yearly">pertahun</option> -->
              </select>
              <select name="stocks-filter-week" id="stocks-filter-week" style="display: unset;">
                <option value="semua" selected>semua</option>
                <option value="1">minggu 1</option>
                <option value="2">minggu 2</option>
                <option value="3">minggu 3</option>
                <option value="4">minggu 4</option>
                <option value="5">minggu 5</option>
              </select>
              <input type="month" name="s" id="stocks-filter-my" style="display: unset;">
              <input type="number" min="2020" max="2030" step="1" value="2024" id="stocks-filter-year" style="display: none;"/>
            </div>
          </div>
          <div class="chart-body">
              <canvas id="stockChartData"></canvas>
          </div>
        </div>

        <div class="card finance-charts" id="finance-charts">
          <div class="chart-headers">
            <p4>Historis Keuangan</p4>
            <div class="filters">
              <i class="fas fa-filter mr-2"></i>
              <select name="finance-filter" id="finance-filter">
                <option value="daily" selected>Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <!-- <option value="yearly">pertahun</option> -->
              </select>
              <select name="finance-filter-week" id="finance-filter-week" style="display: unset;">
                <option value="semua" selected>semua</option>
                <option value="1">minggu 1</option>
                <option value="2">minggu 2</option>
                <option value="3">minggu 3</option>
                <option value="4">minggu 4</option>
                <option value="5">minggu 5</option>
              </select>
              <input type="month" name="s" id="finance-filter-my" style="display: unset;">
              <input type="number" min="2020" max="2030" step="1" value="2024" id="finance-filter-year" style="display: none;"/>
            </div>
          </div>
          <div class="chart-body">
            <canvas id="financialChartData"></canvas>
          </div>
        </div>
        
        <div class="card financialFlow-charts" id="financialFlow-charts">
          <div class="chart-headers">
            <p4>Historis Arus Kas</p4>
            <div class="filters">
              <i class="fas fa-filter mr-2"></i>
              <select name="cash-flow-filter" id="cash-flow-filter">
                <option value="daily" selected>Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <!-- <option value="yearly">pertahun</option> -->
              </select>
              <select name="cash-flow-filter-week" id="cash-flow-filter-week" style="display: unset;">
                <option value="semua" selected>semua</option>
                <option value="1">minggu 1</option>
                <option value="2">minggu 2</option>
                <option value="3">minggu 3</option>
                <option value="4">minggu 4</option>
                <option value="5">minggu 5</option>
              </select>
              <input type="month" name="s" id="cash-flow-filter-my" style="display: unset;">
              <input type="number" min="2020" max="2030" step="1" value="2024" id="cash-flow-filter-year" style="display: none;"/>
            </div>
          </div>
          
          <div class="chart-body">
            <canvas id="cashFlowChartData"></canvas>
          </div>
        </div>
      </div>
    </div>
`;

const createSettingTemplate = () => {
  return `
  <div class="container-settings">
    <div class="settings-header">
      <p>Daftar Akun</p>
      <button id="addAccount">+Akun</button>
    </div>
    <div class="card">
      <ul id="userList">
        
      </ul>
    </div>
    <div class="settings-header">
      <p>Daftar Bahan</p>
      <button>+Bahan</button>
    </div>
    <!--  -->
    <div class="card">
      <div class="materials-list">
        <div class="material-name">
          <p>Roti</p>
        </div>
        <div class="material-list">
          <ul>
            <li class="list-item">
              <table>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Satuan</th>
                  <th></th>
                </tr>
                <tr>
                  <td>1</td>
                  <td>Roti Tawar</td>
                  <td>Rp5.500</td>
                  <td>porsi</td>
                  <td>
                    <div class="user-actions">
                      <i class="fa fa-edit"></i>
                      <i class="fa fa-trash"></i>
                    </div>
                  </td>
                </tr>
              </table>
            </li>
          </ul>
        </div>
      </div>
      <div class="materials-list">
        <div class="material-name">
          <p>Selai</p>
        </div>
        <div class="material-list">
          <ul>
            <li class="list-item">
              <table>
                <tr>
                  <th>#</th>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Satuan</th>
                  <th></th>
                </tr>
                <tr>
                  <td>1</td>
                  <td>Strawberry</td>
                  <td>Rp30.000</td>
                  <td>500gr</td>
                  <td>
                    <div class="user-actions">
                      <i class="fa fa-edit"></i>
                      <i class="fa fa-trash"></i>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Blueberry</td>
                  <td>Rp30.000</td>
                  <td>500gr</td>
                  <td>
                    <div class="user-actions">
                      <i class="fa fa-edit"></i>
                      <i class="fa fa-trash"></i>
                    </div>
                  </td>
                </tr>
              </table>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
 `;
};

const createLoginTemplate = () => {
  return ` 
  <div class="container-login"> 
    <div class="card-login component"> 
      <div class="card-login-items image"> 
        <img src="" alt="RBPlogo"> 
      </div> 
      <div class="card-login-items inputs"> 
        <div class="card-login-item head"> 
          <p>Login</p> 
        </div> 
        <div class="card-login-item body"> 
          <div> 
            <label for="email">Email/Username :</label> 
            <input type="text" id="email" name="email" required /> 
          </div> 
          <div> 
            <label for="password">Password:</label> 
            <div style="position: relative"> 
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
              /> 
              <button type="button" id="togglePassword"> 
                <i class="fas fa-eye-slash" id="eyeIcon"></i> 
              </button> 
            </div> 
          </div> 
        </div> 
        <div class="card-login-item foot" > 
          <div id="loginForm"> 
            <button type="submit" >Login</button> 
          </div> 
        </div> 
      </div> 
    </div> 
  </div> 
  `;
};

const create404Page = `
  <div class="error-container">
   <img alt="RBPlogo" class="error-image" height="300" src="https://storage.googleapis.com/a1aa/image/zevZQop2JHSufExsTkhjG7GBjpPtlzu2UBkrhxe0gDnAmHznA.jpg" width="400"/>
   <h1 class="error-heading">
    404
   </h1>
   <p class="error-paragraph">
    Oops! Halaman yang kamu cari tidak ada.
   </p>
   <a class="error-button" href="#/login">
    Kembali
   </a>
  </div>
`;

export {
  createHomeTemplate,
  createModalTemplate,
  createSalesTemplate,
  createFinanceTemplate,
  createShoppingRowTemplate,
  createSettingTemplate,
  createLoginTemplate,
  create404Page,
};
