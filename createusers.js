const bcrypt = require("bcrypt");
const db = require("./db");

async function createUser() {
  const username = "fitrah";
  const plainPassword = "fitrah123";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    console.log("✅ User berhasil ditambahkan");
  } catch (err) {
    console.error("❌ Gagal tambah user:", err);
  }
}

createUser();
