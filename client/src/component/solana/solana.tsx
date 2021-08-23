import { clusterApiUrl, Connection, Transaction , PublicKey} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import React, { useEffect, useLayoutEffect, useState } from "react";
import * as api from "../../action/mintTokenAction"
import { pickBy } from "lodash";
import * as splToken from "@solana/spl-token";

import {parse, stringify, toJSON, fromJSON} from 'flatted';
// import Wallet from "../solanaWallet/wallet"
declare const window: any;

const Solana = () => {

  let [cnxnStatus, setCnxnStatus] = useState(window.solana.isConnected ? "Disconnect" : "Connect");
  let [pubkey, setPubkey] = useState('no pk');
  let [mintPK, setMintPK] = useState('');
  let [myMintPK, setMyMintPK] = useState('');

  // const getProvider = () => {
  //   if ("solana" in window) {
  //     const provider = window.solana;
  //     if (provider.isPhantom) {
  //       return provider;
  //     }
  //   }
  //   window.open("https://phantom.app/", "_blank");
  // };

  const connectAction = async () => {
    console.log(window.solana.isConnected);

    if (!window.solana.isConnected) {
      await window.solana.connect();
      setCnxnStatus('Disconnect');
      console.log('connected');
      

    }
    else {
      await window.solana.disconnect();
      setCnxnStatus('Connect');
      setPubkey('deleted');
      

    }
  }

  const createWallet = async () => {
    api.createWallet().then(res => {
      console.log('wallet', res.data.wallet);
    });
  }

  const createNFTByMyContract = async () => {

    var connection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed',
    );

    

    let data = {
      'walletPK': window.solana.publicKey?.toString(),
      // 'transaction' : signedTransaction ,
      // 'signature': signature
    };
    console.log('data', data);
/*

    const mintAccount = web3.Keypair.generate();

    const balanceNeeded = await splToken.Token.getMinBalanceRentForExemptMint(
      connection,
    );
  
    // const transaction = new web3.Transaction();
    const transaction2 = new web3.Transaction();

  // let myToken = new splToken.Token(
  //   connection ,
  //   mintAccount.publicKey,
  //   myProgramId,
  //   marketplaceWallet
  // )

// console.log('splToken.MintLayout',splToken.MintLayout);

  // transaction2.add(
  //   web3.SystemProgram.createAccount({
  //     fromPubkey: window.solana.publicKey,
  //     newAccountPubkey: mintAccount.publicKey,
  //     lamports: balanceNeeded,
  //     space: splToken.MintLayout.span,
  //     programId: splToken.TOKEN_PROGRAM_ID,
  //   }),
  // );
    transaction2.add(
      splToken.Token.createInitMintInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        0,
        window.solana.publicKey,
        null,
      ),
    );


let to = new web3.PublicKey('5R7BnfH2kuvxU4WRhog4vBmCABXQB9Y1hkHu8hqh3MyF');
  // transaction.add(
  //   web3.SystemProgram.transfer({
  //   fromPubkey: window.solana.publicKey,
  //   toPubkey: to,
  //   lamports: 100
  // })
  // );

    transaction2.feePayer = window.solana.publicKey;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;



    transaction2.sign(mintAccount);

    console.log('transaction', transaction2);

    
    const signedTransaction  = await window.solana.signTransaction(transaction2);
    
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('signedTransactions', signedTransaction);
      console.log('signature', signature);
    

*/
    api.mintMyNFT(data).then(async res => {
      // console.log('token', parse(res.data.token));
      console.log('res', res.data.transaction);
      let transaction = res.data.transaction as Transaction;
    console.log('transaction', transaction);
    });
// let transaction = new web3.Transaction();
// tran.instructions.forEach(ins =>{
//   transaction.add(ins);
// });
/*

    // transaction.add(res.data.transaction.instructions[0])
    transaction.feePayer = window.solana.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

      console.log('transaction', transaction);

      // const signedTransaction = await window.solana.signTransaction(transaction);
      // const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      // console.log('signedTransaction', signedTransaction);
      // console.log('signature', signature);

      // setMintPK(JSON.stringify(signature));
      setMintPK(res.data.token);
    });
    */

  }


  const createNFT = async () => {

    var connection = new Connection(
      clusterApiUrl('devnet'),
      'confirmed',
    );



    let data = {
      'walletPK': window.solana.publicKey?.toString(),
      // 'transaction' : signedTransaction ,
      // 'signature': signature
    };
    console.log('data', data);

    


    api.mintNFT(data).then(async res => {
      // console.log('token', parse(res.data.token));
      console.log('res', res.data);

    // const transaction = new web3.Transaction();
    // transaction.add(res.data.transaction.instructions[0])
    // transaction.feePayer = window.solana.publicKey;
    // transaction.recentBlockhash = (
    //   await connection.getRecentBlockhash()
    // ).blockhash;
    //   const signedTransaction = await window.solana.signTransaction(transaction);
    //   const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    //   console.log('signedTransaction', signedTransaction);
      console.log('tokenPK', res.data.token);

      // setMintPK(JSON.stringify(signature));
      setMintPK(res.data.token);
    });
    

  }



  useEffect(() => {
    setTimeout(() => {
      setPubkey(window.solana.publicKey?.toString());
      console.log(window.solana.publicKey?.toString());

    }, 10000)
    setPubkey(window.solana.publicKey?.toString());

    
    // console.log('setPubkey',pubkey);
    

  }, [window.solana.publicKey])


  // useEffect(() => {

  //   setPubkey(window.solana.publicKey?.toString())

  // }, [window.solana.isConnected]);


  return (
    <div>
      <h3>user panel</h3>
      <div>
        <h2>walletPK : {pubkey}</h2>
        <button onClick={() => { connectAction() }} >

          {cnxnStatus}
        </button>
      </div>
      {window.solana.publicKey && (
        <div>

          <button onClick={() => { createNFT() }} >

            Create NFT
          </button>

          <button onClick={() => { createNFTByMyContract() }} >

            Create My NFT
          </button>

          <br></br>
          {mintPK}
        </div>)}
      {/* <Wallet></Wallet> */}
    </div>
  )
};
export default Solana

