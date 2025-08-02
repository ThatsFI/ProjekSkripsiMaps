const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
const port = 3000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "rahasia_super_aman",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// ✅ Proses login dengan DB
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(401).send("Username tidak ditemukan");
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send("Password salah");
    }

    req.session.loggedIn = true;
    req.session.user = { id: user.id, username: user.username };

    console.log("Login Berhasil", username, password);

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Terjadi kesalahan server");
  }
});

app.get("/dashboard2", protectRoute, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard2.html"));
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      res.status(500).send("Gagal logout");
    } else {
      res.redirect("/");
    }
  });
});

function protectRoute(req, res, next) {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/");
  }
}

app.get("/dashboard", protectRoute, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.listen(port, () => {
  console.log(`✅ Server aktif di http://localhost:${port}`);
});
