import React, { useEffect, useState } from "react";
import Blockies from "react-blockies";

import { makeStyles } from '@material-ui/core/styles';



const truncateAddress = (address) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

const Wallet = () => {
  const classes = useStyles();
  const [tronAddress, setTronAddress] = useState("")


  useEffect(() => {

});
const handleClickConnect = async () => {
  //await connectWallet();
  if(window.tronWeb && window.tronWeb.ready) {
  const address = window.tronWeb.defaultAddress.base58
  setTronAddress(address);
  }
};

const handleClickAddress = () => {
 setTronAddress("");


};

  
  return (
    <button
      className={classes.btn}
      onClick={tronAddress ? handleClickAddress : handleClickConnect}>
      <Blockies
        className={classes.img}
        seed={tronAddress.toLowerCase()}
        size={8}
        scale={3}
      />
      <div>
        {tronAddress ? truncateAddress(tronAddress) : "Tron Wallet"}
      </div>
    </button>
  );
}

const useStyles = makeStyles((theme) => ({
  btn: {
    background: 'rgb(183,192,238)',
    cursor: 'pointer',
    border: 0,
    outline: 'none',
    borderRadius: 9999,
    height: 35,
    display: 'flex',
    alignItems: 'center'
  },
  img: {
    borderRadius: 999,
    marginRight: 5
  }
}));

export default Wallet;