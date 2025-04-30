import express from "express";
import routes from "./routes/routes.js";
import cors from "cors";
import { config } from "dotenv";

config();

const app = express();
const origins = process.env.ORIGIN.split(",");

app.use(
  cors({
    origin: function (origin, callback) {
      // Проверяем, разрешен ли источник
      if (origins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/v1", routes);

export default app;
