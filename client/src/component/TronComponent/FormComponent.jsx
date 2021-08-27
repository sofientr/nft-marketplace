import React, { useState, useEffect } from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import Paper from "@material-ui/core/Paper";


// material ui
import {  Container, Grid, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckIcon from "@material-ui/icons/Check";
import swal from 'sweetalert2/src/sweetalert2.js'


import { pinJSONToIPFS, pinFileToIPFS, encodedParams } from "../../utils/ipfs";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

const FormComponent = (
  { signerAddress, setTrsHash, setErr, networkId, setOpen ,external ,setDeployedContract,setTriggerModal }) => {
  const classes = useStyles();

  // hooks
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [surl, setSurl] = useState('');
  const [address, setAddress] = useState('');

  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [nftType, setNftType] = useState('ERC721');
  const [ercTwoNum, setErcTwoNum] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    desc: "",
    file: "",
  })
 

  
  // validate form
  const validateName = () => {
    if (name === "") {
      setErrors(pS => ({ ...pS, name: 'Name cannot be empty' }))
    } else {
      setErrors(pS => ({ ...pS, name: '' }))
    }
  }
  const validateDesc = () => {
    if (desc === "") {
      setErrors(pS => ({ ...pS, desc: 'Add description for your token' }))
    } else {
      setErrors(pS => ({ ...pS, desc: '' }))
    }
  }
  // handle file upload
  const handleFile = async (e) => {
    setFile(e.target.files[0]);
    if (e.target.files.length !== 0) {
      const reader = new FileReader();
      reader.onload = e => {
        setImgSrc(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }
  const onSubmit = async (e) => {
   
    e.preventDefault();
    const tronWeb = window.tronWeb

    
    const address = window.tronWeb.defaultAddress.base58
    console.log("add",address)

    if (name && desc && file && address) {
      setIsLoading(true);
      setErr('');
      setTrsHash('');
      const imgHash = await pinFileToIPFS(file);
      toast("File uploaded to IPFS", { type: "success" });

      const ipfsHash = await pinJSONToIPFS({
        name: name,
        description: desc,
        image: 'https://gateway.pinata.cloud/ipfs/' + imgHash,
        external_url: surl
      })
      toast("JSON data uploaded to IPFS", { type: "success" });
      console.log(ipfsHash)

 

      let contract = await tronWeb.contract().at("TX2HV8qf2B2RByXbnie24iTW5w5T2matFp")
      console.log("kkk",contract)
      try{
      const resp = await contract.mintWithTokenURI(address,30,'https://gateway.pinata.cloud/ipfs/' + ipfsHash).send({
      from: address,
      shouldPollResponse:true
      });
      console.log("hh",resp)
      if(resp){
        alert("NFT Minted", { type: "success" });
        setIsLoading(false);
        setTrsHash("ok");
        setTriggerModal(true);
        setName('')
        setDesc('')
        setSurl('')
        setFile('')
        setImgSrc('')
      }}
      catch(error){
        setIsLoading(false);
        setErr("Transaction Failed")
      }
  }
  else {
    validateName();
    validateDesc();
    if (!address) {
      setOpen(true);
      setErr("Wallet not found");
    } else
      setErr("Enter all mandatory fields");
  }
     
  };

  return (
    <>
       
      {<h2>Mint Your NFT With TRON</h2>}



    <form className={classes.root} noValidate autoComplete="off" onSubmit={onSubmit}>
      <div className={classes.formGroup}>
        <label className={classes.formGroupLabel}>Name of NFT</label>
        <input
          type="text"
          style={{ border: errors.name ? '1px solid tomato' : '1px solid black' }}
          placeholder=""
          className={classes.formGroupInput}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          
          }}
          onBlur={validateName}
          required
        />
        {errors.name && <p className={classes.error}>{errors.name}</p>}
      </div>
      <div className={classes.formGroup}>
        <label className={classes.formGroupLabel}>Description</label>
        <input
          type="text"
          style={{ border: errors.desc ? '1px solid tomato' : '1px solid black' }}
          placeholder=""
          className={classes.formGroupInput}
          value={desc}
          onChange={(e) => {
            setErrors(pS => ({ ...pS, desc: '' }));
            setDesc(e.target.value)
          }}
          onBlur={validateDesc}
          required
        />
        {errors.desc && <p className={classes.error}>{errors.desc}</p>}
      </div>
      <div className={classes.formGroup}>
        <label className={classes.formGroupLabel}>Social Media URL</label>
        <input
          type="url"
          placeholder=""
          className={classes.formGroupInput}
          value={surl}
          pattern="https?://.+"
          onChange={(e) => setSurl(e.target.value)}
        />
      </div>

      <div className={classes.endCont}>

        <div className={classes.formGroup} style={{ margin: '0.5rem 0' }}>
          <label className={classes.formGroupLabel}> NFT image  </label>
          <div className={classes.formGroupFile}>
            <input accept="image/*" id="upload-company-logo" onChange={handleFile} type='file' hidden />
            <label htmlFor="upload-company-logo">
            <Button component="span" >
                <Paper elevation={5}>
                  <Avatar src={imgSrc} className={classes.Avatar} variant='rounded' />
                </Paper>
              </Button>
            </label>
          </div>
          {file && <p>{file.name}</p>}
        </div>

      </div>

      <Button type="submit" className={`${classes.submit} ${classes.filled} ${
                    isLoading && classes.btnWithLoader
                  }`}
                  style={{ marginBottom: "50px" }}
                >Submit
                
                {isLoading && (
                    <CircularProgress
                      className={`${classes.loading}`}
                      size={50}
                    />
                  )}
                  </Button>
      
    </form>
    </>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: 200,
    },
  },
  error: {
    margin: '2px 0px',
    textAlign: 'left',
    color: 'tomato'
  },
  formGroup: {
    margin: '0 auto 1rem auto',
    padding: '0.25rem'
  },
  formGroupLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.125rem',
    marginBottom: '0.5rem'
  },
  formGroupInput: {
    display: 'block',
    width: '100%',
    height: '2.375rem',
    padding: '0.375rem 0.75rem',
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
    backgroundClip: 'padding-box',
    border: '1px solid black',
    borderRadius: '0.25rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    'hover': {

    }
  },
  endCont: {
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      display: 'block'
    },
  },
  formGroupFile: {
    display: 'flex'
  },
  formGroupFileImg: {
    marginRight: 20
  },
  typeButton: {
    marginRight: 10,
    border: `2px solid ${theme.palette.btn}`,
    color: 'rgba(0, 0, 0, 0.26)',
   backgroundColor: theme.palette.btn,
    '&:hover': {
      background: theme.palette.btn,
    },
    "&:disabled": {
      border: `2px solid ${theme.palette.text.primary}`,
      color: 'rgba(0, 0, 0, 1)'
    }
  },
  quant: {
    margin: 0,
    marginTop: 10,
    fontSize: 16,
    textAlign: 'left'
  },
  quantInput: {
    width: '80px',
    marginLeft: 10,
    padding: '0.375rem 0.75rem',
    color: theme.palette.text.primary,
    backgroundColor: 'transparent',
    backgroundClip: 'padding-box',
    border: '1px solid black',
    borderRadius: '0.25rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    'hover': {

    }
  },
  submit: {
    backgroundColor: theme.palette.btn,
    padding: '10px 16px',
    fontSize: 18,
    backgroundColor: '#6247aa',
    backgroundImage: 'linear-gradient(316deg, #6247aa 0%, #a594f9 74%)',
    width: '466px',
    borderRadius: '20px',
    boxShadow: '17px 17px 17px -2px rgb(0 0 0 / 25%)',
    color: '#504f4f',
    '&:hover': {
      background: theme.palette.btn,
       //border: `2px solid ${theme.text.primary}`,
      
    }
  }
}));
export default withRouter(FormComponent);
