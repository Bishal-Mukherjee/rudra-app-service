const fs = require("fs");
const https = require("https");
const path = require("path");

const certDir = path.join(__dirname, "..", "certs");
const certPath = path.join(certDir, "global-bundle.pem");
const certUrl =
  "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem";

if (fs.existsSync(certPath)) {
  console.log(`RDS CA cert already exists at ${certPath}`);
  process.exit(0);
}

if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

https
  .get(certUrl, (response) => {
    if (response.statusCode !== 200) {
      console.error(
        `Failed to download RDS CA cert: HTTP ${response.statusCode}`,
      );
      process.exit(1);
    }

    const file = fs.createWriteStream(certPath);
    response.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log(`Downloaded RDS CA cert to ${certPath}`);
    });
  })
  .on("error", (err) => {
    console.error("Failed to download RDS CA cert:", err.message);
    process.exit(1);
  });
