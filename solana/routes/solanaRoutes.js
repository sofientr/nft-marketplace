const express = require("express");
const route = express.Router();

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


//pass on controllers
route.post("/createWallet", runValidation, createWallet);
route.post("/connectWallet", runValidation, connectWallet);
route.post("/mint", runValidation, mint);
route.post("/createMint", runValidation, createMint);
route.post("/initMint", runValidation, initMint);
route.post("/deploy", runValidation, deploySmartContract);



module.exports = route;
