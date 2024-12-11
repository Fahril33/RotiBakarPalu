import { createSettingTemplate } from "../template/template-creator";
import "../../../styles/settings.css";
import RBPsource from "../../../data/source";
import Swal from "sweetalert2";
import { checkUserRole } from "../../utils/interceptor";
import { closeModal, showModal } from "../../utils/sales/modal-handler";

const Settings = {
  async render() {
    return `
      <div class="content">
        ${createSettingTemplate()}
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

    document
      .getElementById("addAccount")
      .addEventListener("click", async () => {
        await this.addNewUser();
      });

    await this.displayUsers();
  },
  //
  // endof afterrender
  //

  async addNewUser() {
    const modalContent = `
    <div class="modal-content">
    <span class="close">&times;</span>
      <h2>Tambah Akun</h2>
      <form id="addAccountForm">
        <div class="form-group">
          <label for="fullName">Nama Lengkap</label>
          <input type="text" id="fullName" name="fullName" required/>
        </div>
        <div class="form-group">
          <label for="userNama">Nama Pengguna</label>
          <input type="text" id="userName" name="userNama" required />
          <span class="error" id="usernameError">Username tidak boleh mengandung spasi.</span>
          <span class="error" id="usernameDuplicate">Username sudah terdaftar, silahkan gunakan username lain.</span>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required />
          <span class="error" id="emailDuplicate">Email sudah terdaftar, silahkan gunakan username lain.</span>
        </div>
        <div class="form-group">
          <label for="password">Kata Sandi</label>
          <input type="text" id="password" name="password" required />
        </div>
        <div class="form-group">
          <label for="phoneNumber">Nomor Telepon</label>
          <input type="text" id="phoneNumber" name="phoneNumber" required/>
          <span class="error" id="phoneError">Nomor telepon harus terdiri dari 10 hingga 15 digit dan hanya angka.</span>        
          <span class="error" id="phoneDuplicate">Nomor telepon ini sudah dipakai.</span>        
        </div>
        <div class="form-group">
          <label for="address">Alamat</label>
          <input type="text" id="address" name="address" required/>
        </div>
        <div class="form-group">
          <label for="position">Penempatan</label>
          <input type="text" id="position" name="position" required/>
        </div>
        <div class="form-group">
          <label for="userRole">Posisi </label>
          <select id="userRole" name="userRole">
            <option value="User" selected>Karyawan</option>
            <option value="manager">Manager</option>
          </select>
        </div>   
        <div class="form-group">
          <label for="userStatus">Status</label>
          <select id="userStatus" name="userStatus">
            <option value="active" selected>Aktif</option>
            <option value="inactive">Non-aktif</option>
          </select>
        </div>   
        <div class="form-group">
          <button type="submit">Tambahkan</button>
        </div>
      </form>
    </div>
    `;

    //
    const modal = showModal(modalContent);

    modal
      .querySelector("#addAccountForm")
      .addEventListener("submit", async (e) => {
        e.preventDefault();

        // Mengambil elemen pesan kesalahan
        const errorElements = {
          usernameError: document.getElementById("usernameError"),
          phoneError: document.getElementById("phoneError"),
          usernameDuplicated: document.getElementById("usernameDuplicate"),
          emailDuplicated: document.getElementById("emailDuplicate"),
          phoneDuplicated: document.getElementById("phoneDuplicate"),
        };

        // Reset pesan kesalahan
        Object.values(errorElements).forEach((el) => {
          el.style.display = "none";
        });

        // VALUE CATCHER
        const fullName = modal.querySelector("#fullName").value;
        const password = modal.querySelector("#password").value;
        const address = modal.querySelector("#address").value;
        const position = modal.querySelector("#position").value;
        const userRole = modal.querySelector("#userRole").value;
        const userStatus = modal.querySelector("#userStatus").value;
        const email = modal.querySelector("#email").value;
        const userName = modal.querySelector("#userName").value;
        const phoneNumber = modal.querySelector("#phoneNumber").value;

        // Validasi username
        const usernameRegex = /^[^\s]+$/; // Username tidak boleh mengandung spasi
        if (!usernameRegex.test(userName)) {
          errorElements.usernameError.style.display = "inline"; // Tampilkan pesan kesalahan
          return;
        }

        // Validasi nomor telepon
        const phoneRegex = /^[0-9]{10,15}$/; // Nomor telepon harus terdiri dari 10 hingga 15 digit
        if (!phoneRegex.test(phoneNumber)) {
          errorElements.phoneError.style.display = "inline"; // Tampilkan pesan kesalahan
          return;
        }

        try {
          const token = localStorage.getItem("token"); // Ambil token dari local storage

          if (!token) {
            console.warn("No token found in localStorage");
            return;
          }

          const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-auth-token": token, // Menyertakan token di header
              },
              body: JSON.stringify({
                fullname: fullName,
                address: address,
                phone: phoneNumber,
                username: userName,
                email: email,
                password: password,
                role: userRole,
                status: userStatus,
                position: position,
              }),
            }
          );

          const data = await response.json();

          // Menangani kondisi ketika pengguna atau email sudah ada
          if (!response.ok) {
            if (response.status === 400) {
              // Memeriksa field mana yang sudah ada
              if (data.msg.includes("email")) {
                errorElements.emailDuplicated.style.display = "inline";
              }
              if (data.msg.includes("username")) {
                errorElements.usernameDuplicated.style.display = "inline";
              }
              if (data.msg.includes("phone")) {
                errorElements.phoneDuplicated.style.display = "inline";
              }
              return;
            } else {
              console.error("Server error:", data.msg); // Menangani kesalahan lain
              Swal.fire({
                title: "Error!",
                text: "Terjadi kesalahan server, coba lagi nanti.",
                icon: "error",
                width: "400px",
                padding: "2em",
                background: "#fff",
                confirmButtonText: "OK",
              });
              return;
            }
          }

          // Jika berhasil
          Swal.fire({
            title: "Akun Berhasil Ditambahkan!",
            text: "Akun baru telah berhasil ditambahkan ke sistem.",
            icon: "success",
            width: "400px",
            padding: "2em",
            background: "#fff",
            confirmButtonText: "OK",
          });

          // Close the modal after submission
          closeModal(modal);
        } catch (error) {
          console.error("Error Adding New Account:", error);
          Swal.fire({
            title: "Error!",
            text: "Terjadi kesalahan server, coba lagi nanti.",
            icon: "error",
            width: "400px",
            padding: "2em",
            background: "#fff",
            confirmButtonText: "OK",
          });
        }
      });
  },

  async displayUsers() {
    try {
      const dataUsers = await RBPsource.getAllUsers();
      console.log("Data Users:", dataUsers);

      // Pastikan dataUsers adalah array
      if (!Array.isArray(dataUsers)) {
        console.error("Data users is not an array");
        return;
      }

      // Ambil elemen container
      const userList = document.getElementById("userList");
      userList.innerHTML = ""; // Kosongkan daftar pengguna sebelum menambahkan yang baru

      // Cek jika tidak ada pengguna
      if (dataUsers.length === 0) {
        userList.innerHTML = "<li>Tidak ada pengguna yang ditemukan.</li>";
        return;
      }

      // Render user list
      dataUsers.forEach((user) => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-item");

        listItem.innerHTML = `
        <div class="user-infos">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/John_Cena_2024.jpg" alt="${
            user.name
          }" />
          <div class="user-info">
            <div class="user-info-basic">
              <p class="user-name">
                ${user.fullname || user.username} 
                ${
                  user.role === "manager"
                    ? `<span class="userRole">
                      <i class="fas fa-crown"></i>
                    </span>`
                    : `<span class="status ${user.status}">●</span>`
                }
                
              </p>
              <p class="user-position">${user.position}</p>
            </div>
            <div class="user-info-full" hidden>
              <div class="info">
                <div class="info-item">
                  <span class="info-label">Username</span>
                  <span class="info-symbol">:</span>
                  <span class="info-value">${user.username}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-symbol">:</span>
                  <span class="info-value">${user.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">No. Telp</span>
                  <span class="info-symbol">:</span>
                  <span class="info-value">${user.phone}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Alamat</span>
                  <span class="info-symbol">:</span>
                  <span class="info-value">${user.address}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="user-actions">
            <button class="edit-btn" data-id="${
              user._id
            }"><i class="fa fa-edit" data-id="${user._id}" ></i></button>
            <button class="delete-btn" data-id="${
              user._id
            }"><i class="fa fa-trash"data-id="${user._id}"></i></button>
          </div>
          </div>
        </div>
      `;

        userList.appendChild(listItem);
      });

      // Pilih semua elemen .list-item
      const listItems = document.querySelectorAll(".list-item");
      listItems.forEach((item) => {
        const infoFull = item.querySelector(".user-info-full");

        // Pastikan infoFull ada sebelum menambahkan event listener
        if (infoFull) {
          // Tambahkan event listener untuk mouseenter (hover)
          item.addEventListener("mouseenter", () => {
            infoFull.removeAttribute("hidden"); // Hapus atribut hidden
            setTimeout(() => {
              infoFull.classList.add("expanded"); // Tambahkan kelas untuk animasi
            }, 400);
          });

          // Tambahkan event listener untuk mouseleave
          item.addEventListener("mouseleave", () => {
            infoFull.classList.remove("expanded"); // Hapus kelas animasi
            setTimeout(() => {
              infoFull.setAttribute("hidden", true); // Tambahkan kembali atribut hidden setelah animasi selesai
            }, 300); // Pastikan sesuai durasi animasi CSS (0.3s)
          });
        }
      });
      this.addUserEventListeners();
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat mengambil data pengguna.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  },

  addUserEventListeners() {
    const editButtons = document.querySelectorAll(".edit-btn");
    const deleteButtons = document.querySelectorAll(".delete-btn");

    editButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const userId = e.target.dataset.id;
        await this.openEditModal(userId);
      });
    });

    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = e.target.dataset.id;
        this.deleteUser(userId);
      });
    });
  },

  async openEditModal(userId) {
    // Ambil data pengguna berdasarkan userId
    const user = await RBPsource.getUserById(userId); // Anda perlu membuat fungsi ini
    console.log("user", user);
    const modalContent = `
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2>Edit Pengguna</h2>
    <form id="editUser Form">
      <div class="form-group">
        <label for="fullname">Nama Lengkap:</label>
        <input type="text" id="fullname" name="fullname" value="${
          user.fullname || `none`
        }" required>
      </div>
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" value="${
          user.username
        }" required />
        <span class="error" id="usernameError">Username tidak boleh mengandung spasi.</span>
        <span class="error" id="usernameDuplicate">Username ini sudah terdaftar.</span>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" value="${
          user.email
        }" required>
        <span class="error" id="emailDuplicate">Email sudah terdaftar, silahkan gunakan email lain.</span>
      </div>
      <div class="form-group">
        <label for="address">Alamat:</label>
        <input type="text" id="address" name="address" value="${
          user.address || `none`
        }" required>
      </div>
      <div class="form-group">
        <label for="position">Penempatan:</label>
        <input type="text" id="position" name="position" value="${
          user.position || `none`
        }" required>
      </div>
      <div class="form-group">
        <label for="phone">No. Telpon:</label>
        <input type="text" id="phone" name="phone" value="${
          user.phone || ``
        }" required />
        <span class="error" id="phoneError">Nomor telepon harus terdiri dari 10~15 digit <b>angka</b>.</span>
        <span class="error" id="phoneDuplicate">Nomor telepon ini sudah dipakai.</span>
      </div>
      <div class="form-group">
        <label for="userStatus">Status</label>
        <select id="userStatus" name="userStatus">
          <option value="active" ${
            user.status === "active" ? "selected" : ""
          }>Aktif</option>
          <option value="inactive" ${
            user.status === "inactive" ? "selected" : ""
          }>Non-aktif</option>
        </select>
      </div>   
      <button type="submit">Simpan Perubahan</button>
    </form>
  </div>
  `;

    // Tampilkan modal dengan konten
    const modal = showModal(modalContent);

    // Tambahkan event listener untuk form submit
    document.getElementById("editUser Form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.updateUser(userId, modal);
    });

    // Tambahkan event listener untuk menutup modal
    modal.querySelector(".close").addEventListener("click", () => {
      modal.style.display = "none";
    });
  },

  async updateUser(userId, modal) {
    const fullname = document.getElementById("fullname").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const position = document.getElementById("position").value;
    const phone = document.getElementById("phone").value;
    const status = document.getElementById("userStatus").value;

    // Mengambil elemen pesan kesalahan
    const errorElements = {
      usernameError: document.getElementById("usernameError"),
      phoneError: document.getElementById("phoneError"),
      usernameDuplicated: document.getElementById("usernameDuplicate"),
      phoneDuplicated: document.getElementById("phoneDuplicate"),
      emailDuplicated: document.getElementById("emailDuplicate"),
    };

    // Reset pesan kesalahan
    Object.values(errorElements).forEach((el) => (el.style.display = "none"));

    // Validasi username
    if (username.includes(" ")) {
      errorElements.usernameError.style.display = "inline";
      return;
    }

    // Validasi nomor telepon
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      errorElements.phoneError.style.display = "inline";
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({
            fullname,
            username,
            email,
            address,
            position,
            phone,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          // Memeriksa field mana yang sudah ada
          if (data.msg.includes("email")) {
            errorElements.emailDuplicated.style.display = "inline";
          }
          if (data.msg.includes("username")) {
            errorElements.usernameDuplicated.style.display = "inline";
          }
          if (data.msg.includes("phone")) {
            errorElements.phoneDuplicated.style.display = "inline";
          }
          return;
        } else {
          console.error("Server error:", data.msg); // Menangani kesalahan lain
          Swal.fire({
            title: "Error!",
            text: "Terjadi kesalahan server, coba lagi nanti.",
            icon: "error",
            width: "400px",
            padding: "2em",
            background: "#fff",
            confirmButtonText: "OK",
          });
          return;
        }
      }

      // Refresh daftar pengguna setelah update
      this.displayUsers();
      Swal.fire({
        title: "Sukses!",
        text: "Data pengguna berhasil diubah.",
        icon: "success",
        width: "400px",
        padding: "2em",
        background: "#fff",
        confirmButtonText: "OK",
      });
      closeModal(modal);
    } catch (error) {
      // console.error("Error updating user:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat memperbarui pengguna.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  },

  async deleteUser(userId) {

    const recentUser = await RBPsource.getUserData()
    if (userId === recentUser.id) {
      Swal.fire({
        title: "Error!",
        text: "Menghapus data sendiri tidak diperkenankan.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirmDelete = await Swal.fire({
      title: "Konfirmasi!",
      text: "Apakah Anda yakin ingin menghapus data pengguna?",
      icon: "warning",
      width: "400px",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Tidak, batalkan",
    });

    if (!confirmDelete.isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/user/${userId}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error deleting user");
      }

      // Refresh daftar pengguna setelah delete
      this.displayUsers();
      Swal.fire({
        title: "Sukses!",
        text: "Data pengguna berhasil dihapus.",
        icon: "success",
        width: "400px",
        padding: "2em",
        background: "#fff",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus pengguna.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  },
};

export default Settings;
