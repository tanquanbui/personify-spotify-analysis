const express = new Express();
const app = express();
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(4000, () => {
    console.log("Server running on port 3000");
});
app.res(('/') => (req, res))