import { clusterApiUrl, Connection, Transaction, PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import React, { EventHandler, useEffect, useLayoutEffect, useState } from "react";
import * as api from "../../action/mintTokenAction"
import { pickBy } from "lodash";
import * as splToken from "@solana/spl-token";
import { create } from 'ipfs-http-client'
// import SolanaForm from "./solanaForm";

import { parse, stringify, toJSON, fromJSON } from 'flatted';
import Form from "../Form";


import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

// import Wallet from "../solanaWallet/wallet"
declare const window: any;
const client = create({
  url: 'https://ipfs.infura.io:5001/api/v0'
});


const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  input: {
    display: 'none',
  },
}));



const Solana = () => {

  const classes = useStyles();


  let [cnxnStatus, setCnxnStatus] = useState(window.solana.isConnected ? "Disconnect" : "Connect");
  let [solAction, setSolAction] = useState("Mint");
  let [smartContractAddress, setSmartContractAddress] = useState('');
  let [imageFile, setImageFile] = useState();
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
    // let myProgramId = splToken.TOKEN_PROGRAM_ID;
    // let myProgramId = new web3.PublicKey('BP6iWVRjPhqf2LyJJvV3wUDLMMuaHpQfRFBsSx8FAcUp');
    let myProgramId = new web3.PublicKey('JBfHhrGguwdaemUzDsYHdPCqc3ugsMY7goqCKGzifkKU');

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

    

    transaction.sign(mintAccount);
    console.log('transaction', transaction);
    const signedTransaction = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('signedTransaction', signedTransaction);
    console.log('signature', signature);

    let transaction2 = new web3.Transaction();

    let tokenAssocietedAccount: PublicKey = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      window.solana.publicKey
    );

    transaction2.add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana.publicKey,
        window.solana.publicKey

      ));



    console.log('tokenAssocietedAccount', tokenAssocietedAccount.toBase58());

    

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
    
        api.mintNFTByMyContract(data).then(async res => {
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

    

    transaction.sign(mintAccount);
    console.log('transaction', transaction);
    const signedTransaction = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('signedTransaction', signedTransaction);
    console.log('signature', signature);

    let transaction2 = new web3.Transaction();

    let tokenAssocietedAccount: PublicKey = await splToken.Token.getAssociatedTokenAddress(
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



    console.log('tokenAssocietedAccount', tokenAssocietedAccount.toBase58());

    

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
 

const deployMyContract = () =>{
  api.deployContract({}).then(res =>{
    setSmartContractAddress(res.data.programId);
  })
}

  useEffect(() => {
    setTimeout(() => {
      setPubkey(window.solana.publicKey?.toString());
      console.log(window.solana.publicKey?.toString());

    }, 10000)
    setPubkey(window.solana.publicKey?.toString());


    // console.log('setPubkey',pubkey);


  }, [cnxnStatus])

let changeSolAction = ()=>{
  solAction==="Mint" ? setSolAction('Deploy'):setSolAction('Mint')
  
}

  const [fileUrl, updateFileUrl] = useState(``)
  async function onChange(e: React.ChangeEvent<any>) {
    const file = e?.target.files[0];
    // const file = imageFile;
    try {
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      updateFileUrl(url)
      console.log('fileURL', fileUrl);

    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  // useEffect(() => {

  //   setPubkey(window.solana.publicKey?.toString())

  // }, [window.solana.isConnected]);


  return (
    <div>
      <h2>Solana Panel</h2>
      <h3>walletPK : {pubkey}</h3>
     
      <div>
        <button onClick={() => { connectAction() }} >

          {cnxnStatus}
        </button>
      </div>
      


      {window.solana.publicKey && (
        <div>
<div>
        <button onClick={() => { changeSolAction() }} >
          {solAction === "Mint"? 'Deploy' : 'Mint'}
        </button>
        
      </div>
         {solAction==='Mint' && (

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            NFT Details
          </Typography>
          <form className={classes.form} noValidate >
            <Grid container spacing={2}>

              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="name"
                  label="NFT Name"
                  name="name"
                  autoComplete="name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="description"
                  label="Description"
                  type="text"
                  id="description"
                  autoComplete="description"
                />
              </Grid>


              <input
                accept="image/*"
                className={classes.input}
                id="contained-button-file"
                multiple
                type="file"
                onChange={onChange}

              />
              <label htmlFor="contained-button-file">
                <Button variant="contained" color="primary" component="span">
                  Upload
                </Button>
              </label>
              <input accept="image/*" className={classes.input} id="icon-button-file" type="file" />
              {
                fileUrl && (
                  <div>
                    <img src={fileUrl} width="100%" />
                  </div>
                )
              }



              <Grid item xs={12}>

                <Button
                  // type="submit"
                  name="createNFT"

                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                onClick={()=>createNFT()}

                >
                  Create NFT
                </Button>
              </Grid>
              <Grid item xs={12} >

                <Button
                  // type="submit"
                  name="createNFTByMyContract"

                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                onClick={()=>createNFT()}
                // onClick={()=>createNFTByMyContract()}
                >
                  Create NFT With My Contract
                </Button>
              </Grid>
            </Grid>





          </form>
        </div>
          
        {mintPK &&(
  
          <h5>NFT Address: {mintPK}</h5>
        )}
      </Container>
)}
{solAction==='Deploy' && (
  <Container>
    <Grid container spacing={2}>
    <Grid item xs={12}>
    <Button
                  // type="submit"
                  name="deployMyContract"

                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                onClick={()=>deployMyContract()}
                >
                  Create My Own SmartContract
                </Button>
    </Grid>
    </Grid>
    {smartContractAddress &&(
  
  <h5>Deployed Smart Contract Address: {smartContractAddress}</h5>
)}
  </Container>
)}

      </div>)}

    </div>
  )
};
export default Solana

