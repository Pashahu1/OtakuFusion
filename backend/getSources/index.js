import app from "./src/app.js";

const PORT = 3033;
app.listen(PORT, () => {
  console.log("server is running on port :" + PORT);
});
