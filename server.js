// Titik masuk untuk Hostinger (hPanel > Node.js App > Application startup file).
//
// Hostinger menjalankan file ini, bukan `npm start`, dan menentukan port lewat
// environment variable PORT. Aplikasi harus mendengarkan di 0.0.0.0 supaya bisa
// dijangkau dari luar kontainer.
//
// Sebelum dijalankan, pastikan `npm run build` sudah dieksekusi di server
// (tombol "Run NPM Build" / lewat SSH), karena file ini menjalankan hasil build
// produksi, bukan mode pengembangan.

const { createServer } = require("node:http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOST || "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`FiLUP berjalan di http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Gagal menjalankan server FiLUP:", err);
    process.exit(1);
  });
