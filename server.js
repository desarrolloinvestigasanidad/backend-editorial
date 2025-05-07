const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
const path = require("path");

const app = express();

app.use(cors());

const webhookRouter = require("./routes/webhook");
app.use("/webhook", webhookRouter);



app.use(express.json());
app.use(passport.initialize());

app.use("/public", express.static(path.join(__dirname, "public")));

// Rutas de autenticación
app.use("/api", require("./routes/auth"));

app.use("/api/admin", require("./routes/admin"));

// Rutas de módulos básicos y funcionalidades principales
// La ruta de ediciones ahora incluye libros y capítulos anidados.
app.use("/api/editions", require("./routes/editions"));
app.use("/api/books", require("./routes/books"));
app.use("/api/chapters", require("./routes/chapters"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/discounts", require("./routes/discounts"));
app.use("/api/roles", require("./routes/roles"));
app.use("/api/templates", require("./routes/templates"));
app.use("/api/config", require("./routes/config"));
app.use("/api/users", require("./routes/users"));
app.use("/api/clients", require("./routes/clients"));
app.use("/api/publications", require("./routes/publications"));


// Rutas de funcionalidades adicionales
app.use("/api/coauthors", require("./routes/coauthors"));
app.use("/api/pdf", require("./routes/pdf"));
app.use("/api/invoices", require("./routes/invoices"));
app.use("/api/certificates", require("./routes/certificates"));
app.use("/api/panels", require("./routes/panels"));

app.use("/api", require("./routes/uploadRoutes"));

const checkoutRouter = require("./routes/checkout");

app.use("/api/checkout", checkoutRouter);

// Endpoint de Check
app.get("/", (req, res) => {
    res.send("La aplicación está corriendo correctamente.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
