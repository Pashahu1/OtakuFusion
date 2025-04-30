import express from "express";
import routes from "./routes/routes.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["https://otaku-fusion.vercel.app", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});
app.use("/api/v1", routes);

export default app;
