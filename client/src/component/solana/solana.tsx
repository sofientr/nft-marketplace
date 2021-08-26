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



    const mintAccount = web3.Keypair.generate();

    const balanceNeeded = await splToken.Token.getMinBalanceRentForExemptMint(
      connection,
    );

    let transaction = new web3.Transaction();
let myProgramId = splToken.TOKEN_PROGRAM_ID;

    transaction.add(
      web3.SystemProgram.createAccount({
        fromPubkey: window.solana.publicKey,
        newAccountPubkey: mintAccount.publicKey,
        lamports: balanceNeeded,
        space: splToken.MintLayout.span,
        programId: myProgramId,
      }),
    );
  
    transaction.add(
      splToken.Token.createInitMintInstruction(
        myProgramId,
        mintAccount.publicKey,
        0,
        window.solana.publicKey,
        window.solana.publicKey,
      ),
    );



    transaction.feePayer = window.solana.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    /*
    let tokenAssocietedAccount : PublicKey = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      window.solana.publicKey
    );

    console.log('tokenAssocietedAccount',tokenAssocietedAccount.toBase58());
    


    transaction.add(
      splToken.Token.createMintToInstruction(

        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana.publicKey,
        [],
        1,
      )
      )

    transaction.add(
      splToken.Token.createMintToInstruction(
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana.publicKey,
        [],
        1,
      )
      );
      */

    transaction.sign(mintAccount);
      console.log('transaction', transaction);
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('signedTransaction', signedTransaction);
      console.log('signature', signature);

      let transaction2 = new web3.Transaction();

      let tokenAssocietedAccount : PublicKey = await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        window.solana.publicKey
      );

      transaction2.add(
        splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana.publicKey,
        window.solana.publicKey

      ));

    // const tokenAssocietedAccount = web3.Keypair.generate();

  
      console.log('tokenAssocietedAccount',tokenAssocietedAccount.toBase58());

      // transaction2.add(
      //   splToken.Token.createMintToInstruction(
  
      //     myProgramId,
      //     mintAccount.publicKey,
      //     tokenAssocietedAccount,
      //     window.solana.publicKey,
      //     [],
      //     1,
      //   )
      //   )
  
      transaction2.add(
        splToken.Token.createMintToInstruction(
          myProgramId,
          mintAccount.publicKey,
          tokenAssocietedAccount,
          window.solana.publicKey,
          [],
          1,
        )
        );

        transaction2.feePayer = window.solana.publicKey;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

        const signedTransaction2 = await window.solana.signTransaction(transaction2);
      const signature2 = await connection.sendRawTransaction(signedTransaction2.serialize());
      console.log('signedTransaction', signedTransaction2);
      console.log('signature', signature2);

      setMintPK(mintAccount.publicKey.toBase58());


/*

    api.createMint(data).then(async res => {
      // console.log('token', parse(res.data.token));
      console.log('res', res.data.transaction);

      let transaction = new Transaction(); 
      transaction.add((res.data.transaction1 as Transaction).instructions[1]);
    console.log('transaction', transaction);
   
// let transaction = new web3.Transaction();
// tran.instructions.forEach(ins =>{
//   transaction.add(ins);
// });


    // transaction.add(res.data.transaction.instructions[0])
    transaction.feePayer = window.solana.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

      console.log('transaction', transaction);

      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      console.log('signedTransaction', signedTransaction);
      console.log('signature', signature);

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

