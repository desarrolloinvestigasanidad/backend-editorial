const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Rutas de autenticación
app.use("/api", require("./routes/auth"));

// Rutas de módulos básicos
app.use("/api/editions", require("./routes/editions"));
app.use("/api/books", require("./routes/books"));
app.use("/api/chapters", require("./routes/chapters"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/discounts", require("./routes/discounts"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/templates", require("./routes/templates"));
app.use("/api/config", require("./routes/config"));
app.use("/api/users", require("./routes/users"));

// Rutas de funcionalidades adicionales
app.use("/api/coauthors", require("./routes/coauthors"));
app.use("/api/pdf", require("./routes/pdf"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/panels", require("./routes/panels"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));

