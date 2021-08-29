import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { clusterApiUrl, Connection, Transaction, PublicKey } from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import * as api from "../../action/mintTokenAction"
import * as splToken from "@solana/spl-token";
import { create } from 'ipfs-http-client';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import SweetAlert from 'react-bootstrap-sweetalert';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CloudUploadIcon from '@material-ui/icons/CloudUploadSharp';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { BottomNavigation, BottomNavigationAction, FormControl, FormLabel } from "@material-ui/core";

import FormControlLabel from '@material-ui/core/FormControlLabel';


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
  root: {
    width: '100%',
  },
}));

// formik
const validationSchema = yup.object({
  name: yup
    .string()
    .default('Enter your name')
    .required('Name is required'),
  description: yup
    .string()
    .default('Enter a description')
    .required('Description is required'),
  asset: yup
    .mixed()
    .required('File is required'),
  mintType: yup
    .string()
    .default('Marketplace Contract')
    .required()
});


// export const connectSolanaWallet = async () => {
// if (window.solana){

//   if (!window.solana?.isConnected) {
//     await window.solana?.connect();
//     // setCnxnStatus('Disconnect');
//     console.log('connected');
//     let confirmed = window.confirm("You dont have a wallet! \n Do you want to install Phantom wallet?");
//     if (confirmed) { window.open("https://phantom.app/", "_blank") }
//     else { history.push('/') }
    
    
//   }
//   if (window.solana?.isConnected) {
//     // else {
//       await window.solana?.disconnect();
//       // setCnxnStatus('Connect');
//       // setPubkey('deleted');
      
      
//     }
//   }
// } 

const Solana = (solanaWalletPK: string) => {

  const classes = useStyles();
  let history = useHistory();

  let [cnxnStatus, setCnxnStatus] = useState(window.solana?.isConnected ? "Disconnect" : "Connect");
  let [solAction, setSolAction] = useState("Mint");
  let [smartContractAddress, setSmartContractAddress] = useState('');
  let [imageFile, setImageFile] = useState();
  let [pubkey, setPubkey] = useState(solanaWalletPK);
  let [mintPK, setMintPK] = useState('');
  let [myMintPK, setMyMintPK] = useState('');

  // const getProvider = () => {
  //   if ("solana" in window) {
  //     const provider = window.solana?;
  //     if (provider.isPhantom) {
  //       return provider;
  //     }
  //   }
  //   window.open("https://phantom.app/", "_blank");
  // };

  const formik = useFormik({
    initialValues: {
      name: 'My NFT',
      description: 'Description',
      asset: null,
      mintType: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      let mintType = values.mintType;
      if (mintType==="My contract")
      // createNFTByMyContract()
          createNFT()

      else createNFT();

    },
  });


  const connectAction = async () => {
    console.log(window.solana?.isConnected);

    // connectWallet(setCnxnStatus,setPubkey);

    if (!window.solana?.isConnected) {
      await window.solana?.connect();
      setCnxnStatus('Disconnect');
      console.log('connected');


    }
    // if (window.solana?.isConnected) {
    else {
      await window.solana?.disconnect();
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
      'walletPK': window.solana?.publicKey?.toString(),
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
        fromPubkey: window.solana?.publicKey,
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
        window.solana?.publicKey,
        window.solana?.publicKey,
      ),
    );



    transaction.feePayer = window.solana?.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;



    transaction.sign(mintAccount);
    console.log('transaction', transaction);
    const signedTransaction = await window.solana?.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('signedTransaction', signedTransaction);
    console.log('signature', signature);

    let transaction2 = new web3.Transaction();

    let tokenAssocietedAccount: PublicKey = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      window.solana?.publicKey
    );

    transaction2.add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana?.publicKey,
        window.solana?.publicKey

      ));



    console.log('tokenAssocietedAccount', tokenAssocietedAccount.toBase58());



    transaction2.add(
      splToken.Token.createMintToInstruction(
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana?.publicKey,
        [],
        1,
      )
    );

    transaction2.feePayer = window.solana?.publicKey;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    const signedTransaction2 = await window.solana?.signTransaction(transaction2);
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
        transaction.feePayer = window.solana?.publicKey;
        transaction.recentBlockhash = (
          await connection.getRecentBlockhash()
        ).blockhash;
    
          console.log('transaction', transaction);
    
          const signedTransaction = await window.solana?.signTransaction(transaction);
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
      'walletPK': window.solana?.publicKey?.toString(),
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
        fromPubkey: window.solana?.publicKey,
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
        window.solana?.publicKey,
        window.solana?.publicKey,
      ),
    );



    transaction.feePayer = window.solana?.publicKey;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;



    transaction.sign(mintAccount);
    console.log('transaction', transaction);
    const signedTransaction = await window.solana?.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('signedTransaction', signedTransaction);
    console.log('signature', signature);

    let transaction2 = new web3.Transaction();

    let tokenAssocietedAccount: PublicKey = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      window.solana?.publicKey
    );

    transaction2.add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana?.publicKey,
        window.solana?.publicKey

      ));



    console.log('tokenAssocietedAccount', tokenAssocietedAccount.toBase58());



    transaction2.add(
      splToken.Token.createMintToInstruction(
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        window.solana?.publicKey,
        [],
        1,
      )
    );

    transaction2.feePayer = window.solana?.publicKey;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

    const signedTransaction2 = await window.solana?.signTransaction(transaction2);
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
        transaction.feePayer = window.solana?.publicKey;
        transaction.recentBlockhash = (
          await connection.getRecentBlockhash()
        ).blockhash;
    
          console.log('transaction', transaction);
    
          const signedTransaction = await window.solana?.signTransaction(transaction);
          const signature = await connection.sendRawTransaction(signedTransaction.serialize());
          console.log('signedTransaction', signedTransaction);
          console.log('signature', signature);
    
          // setMintPK(JSON.stringify(signature));
          setMintPK(res.data.token);
        });
        */

  }


  const deployMyContract = () => {
    api.deployContract({}).then(res => {
      setSmartContractAddress(res.data.programId);
    })
  }

  useEffect(() => {
    setTimeout(() => {
      setPubkey(window.solana?.publicKey?.toString());
      console.log(window.solana?.publicKey?.toString());

<<<<<<< HEAD
    }, 10000)
=======
    }, 5000)
>>>>>>> 9016b1a2846a298d3021e2d09787fd0ba86c373d
    setPubkey(window.solana?.publicKey?.toString());


    // console.log('setPubkey',pubkey);


  }, [cnxnStatus])

  useEffect(() => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
    let confirmed = window.confirm("You dont have a wallet! \n Do you want to install Phantom wallet?");
    if (confirmed) { window.open("https://phantom.app/", "_blank") }
    else { history.push('/') }
  }, [])

  let changeSolAction = () => {
    solAction === "Mint" ? setSolAction('Deploy') : setSolAction('Mint')

  }

  const [fileUrl, updateFileUrl] = useState(``)
  async function onChange(e: React.ChangeEvent<any>) {
    const file = e?.target.files[0];
    // const file = imageFile;
    try {
      updateFileUrl(file)
      const added = await client.add(file)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      console.log('fileURL', fileUrl);

    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  // useEffect(() => {

  //   setPubkey(window.solana?.publicKey?.toString())

  // }, [window.solana?.isConnected]);


  return (
    <div>
      <h2>Solana Panel</h2>
      {/* {window.solana &&
        <div>
          <Button variant="contained" color="primary" onClick={() => { connectAction() }}>
            {cnxnStatus}

          </Button>
        </div>
      } */}


      {window.solana?.publicKey && (
        <div>
          <div>

            <BottomNavigation
              // value={solAction}
              onChange={(event, newValue) => {
                setSolAction(newValue);
              }}
              showLabels
              className={classes.root}
            >
              <BottomNavigationAction label="Mint" value="Mint" icon={<LocationOnIcon />} color="secondary" />
              <BottomNavigationAction label="Deploy" value="Deploy" icon={<CloudUploadIcon />} color="action" />
            </BottomNavigation>
          </div>
          {solAction === 'Mint' && (

            <Container component="main" maxWidth="xs">
              <CssBaseline />
              <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  NFT Details
                </Typography>


                <form className={classes.form} onSubmit={formik.handleSubmit} >
                  <Grid container spacing={2}>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        variant="outlined"


                        id="name"
                        name="name"
                        label="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        fullWidth

                        id="description"
                        name="description"
                        label="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                      />
                    </Grid>

                    <Grid item xs={12}>

                      <input
                        accept="image/*"
                        className={classes.input}
                        id="asset"
                        name="asset"
                        type="file"
                        onChange={(event: React.ChangeEvent<any>) => {
                          formik.setFieldValue("asset", event.currentTarget.files[0]);
                          onChange(event)
                        }}
                      // onChange={onChange}


                      />

                      <label htmlFor="asset">
                        <Button variant="contained" color="primary" component="span">
                          Upload
                        </Button>
                      </label>
                      <input accept="image/*" className={classes.input} id="asset" type="file" />
                      {
                        fileUrl && (
                          <div>
                            <img src={URL.createObjectURL(formik.values.asset)} width="100%" />
                          </div>
                        )
                      }
                    </Grid>
                    <Grid item xs={12}>


                      <FormControl component="fieldset">
                        <FormLabel component="legend">Choose a Contract</FormLabel>
                        <RadioGroup
                          
                          name="mintType"
                          value={formik.values.mintType}
                          onChange={(event: React.ChangeEvent<any>) => {
                            formik.setFieldValue("mintType", (event.target as HTMLInputElement).value)
                          }}
                        >
                          <FormControlLabel value="My Contract" control={<Radio />} label="My Contract" />
                          <FormControlLabel value="Marketplace's Contract" control={<Radio />} label="Marketplace's Contract" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>

                      <Button
                        // type="submit"
                        name="MintNFT"

                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.submit}

                      >
                        Mint NFT
                      </Button>
                    </Grid>

                  </Grid>





                </form>
              </div>

              {mintPK && (
                <SweetAlert success title="NFT Created!" onConfirm={() => { setMintPK('') }} >
                  NFT Address: {mintPK}
                </SweetAlert>
                // <h5>NFT Address: {mintPK}</h5>
              )}
            </Container>
          )}
          {solAction === 'Deploy' && (
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
                    onClick={() => deployMyContract()}
                  >
                    Create My Own SmartContract
                  </Button>
                </Grid>
              </Grid>
              {smartContractAddress &&
                <SweetAlert success title="Smart Contract Deployed at :" onConfirm={() => { setSmartContractAddress('') }} >
                   {smartContractAddress}
                </SweetAlert>
                // <h5>NFT Address: {mintPK}</h5>
              }
            </Container>
          )}

        </div>)}

    </div>
  )
};
export default Solana;
// export connectWallet ;

