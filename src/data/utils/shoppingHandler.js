import API_ENDPOINT from "../../config/config";

export async function updateShoppingListData(_id, newData) {
  try {
    // Update daftar belanja
    const response = await fetch(`${API_ENDPOINT.DAFTARBELANJA}/${_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      throw new Error("Failed to update data on server.");
    }
  } catch (error) {
    console.error("Error updating shopping list data:", error);
    // Tampilkan pesan error ke pengguna
    alert("Terjadi kesalahan saat mengupdate data");
  }
}
