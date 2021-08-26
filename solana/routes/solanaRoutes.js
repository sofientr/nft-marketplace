const express = require("express");
const route = express.Router();
const {
  requireSignin
} = require("../controllers/authControllers");

const {
  
  createWallet,
  connectWallet,
  mint,
  deploySmartContract,
  createMint,
  initMint

} = require("../controllers/solanaControllers");

//import validator
const { runValidation } = require("../validators");
const {
  userSignupValidator,
  userSigninValidator,
} = require("../validators/authValidator");

//pass on controllers
route.post("/createWallet", runValidation, createWallet);
route.post("/connectWallet", runValidation, connectWallet);
route.post("/mint", runValidation, mint);
route.post("/createMint", runValidation, createMint);
route.post("/initMint", runValidation, initMint);
route.post("/deploy", runValidation, deploySmartContract);

// test
route.get("/secret", requireSignin, (req, res) => {
  res.json({
    user: req.user,
  });
});

module.exports = route;
