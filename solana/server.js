const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

//bring routes

const solanaRouters = require("./routes/solanaRoutes");

//app
const app = express();

//database connect
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log("DB Connected")).catch = (err) => {
  console.log(err.message);
};

//middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(cookieParser());

//cors
if (process.env.NODE_ENV == "development") {

  app.use(cors({ origin: `${process.env.CLIENT_URL}` }));
  console.log(process.env.NODE_ENV,process.env.CLIENT_URL)
}

//routes middleware

app.use("/api", solanaRouters);

//port
const port = process.env.PORT || 8001;
app.listen(port, () => {
  console.log(`Your server is running on port ${port}`);
});
