const app = require("./app");
const { PORT,CUTE } = require("./config");

app.listen(PORT, () => {
  console.log(`Server is listening on PORT: ${PORT}`);
});
