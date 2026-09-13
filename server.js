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
