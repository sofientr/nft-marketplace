const express = require("express");
const route = express.Router();

const {
  
  createWallet,
  connectWallet,
  deploySmartContract,
  createMint,
  createCustomMint

} = require("../controllers/solanaControllers");

//import validator
const { runValidation } = require("../validators");


//pass on controllers
route.post("/createWallet", runValidation, createWallet);
route.post("/connectWallet", runValidation, connectWallet);
route.post("/createMint", runValidation, createMint);
route.post("/mintNFTByMyContract", runValidation, createCustomMint);
route.post("/deploy", runValidation, deploySmartContract);



module.exports = route;
