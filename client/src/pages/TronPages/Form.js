import FormComponent from "../../component/TronComponent/FormComponent";

/*const Form = () => {
  return (
    <React.Fragment>
      <h2 className="text-center pt-4 pb-4">Form</h2>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <FormComponent />
        </div>
      </div>
    </React.Fragment>
  );
};*/

import React, { useState, useEffect } from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';

const Form = () => {
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const [trsHash, setTrsHash] = useState('');
  const [err, setErr] = useState('')
  const [open, setOpen] = React.useState(false);
  const [triggerModal, setTriggerModal] = useState(false);

  useEffect(() => {
    console.log("inEffect")
    if (false) {
      setOpen(true);
    } else setOpen(false);
  })

return (
  <main className={classes.main}>
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      <div className={classes.paper}>
        <Typography variant="h6">
          Your current Network is {} (chain id {}). Change it to Matic testnet 80001 or Matic mainnet 137.
        </Typography>
      </div>

    </Modal>

    {
       trsHash &&<Typography variant="h6" style={{marginBottom:'-50px',border: '1px solid #37af3b',height: '100px'}}>
         &#9989; NFT minted, to show more {''} 
        <a style={{ color: '#ee6f57'}}
          rel="noopener noreferrer"
          target="_blank"
          href={`https://shasta.tronscan.org/#/contract/TX2HV8qf2B2RByXbnie24iTW5w5T2matFp/transactions`}>
          Smart Contract Transactions
      </a>
      </Typography>
    }
     {
       err &&<Typography variant="h6" style={{marginBottom:'-50px',border: '1px solid red',height: '100px',color: 'tomato' }}>
         &#9940; &#9940; Error: {'  ⚠️ '} {err}
      </Typography>
    }
     <div className={classes.cont}>
        {
          isLoading ? <CircularProgress color="secondary" />
            :
            <FormComponent
        
            setIsLoading={setIsLoading}
            setTrsHash={setTrsHash}
            setErr={setErr}
            setOpen={setOpen}
            setTriggerModal={setTriggerModal}

            />
        }
      </div>
    </main>
  );
}
Form.getInitialProps = async (ctx) => {
  return {}
}


const useStyles = makeStyles((theme) => ({
  main: {
    width: '100%',
    margin: '0px auto',
    marginBottom: 20,
    maxWidth: 1100,
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      marginTop: '20px'
    },
  },
  paper: {
    position: 'absolute',
    width: 400,
    top: '45%',
    left: '37%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  title: {
    marginBottom: 20
  },
  cont: {
    maxWidth: 540,
    marginTop:85 ,
    marginLeft:273,
    border: `none`,
    boxShadow: '17px 17px 17px -2px rgb(0 0 0 / 25%)',
    borderRadius: 8,
    width: '100%',
    // background: 'rgba(27, 27, 50, 0.1)',
  // backgroundColor: 'rgb(183,192,238,0.1)',
    backgroundColor: '#d9d9d97a',
    backgroundImage: 'linear-gradient(315deg, #d9d9d94a 0%, #f6f2f229 74%)',
    borderRadius: '35px',
    height: 'max-content',
    padding: 20,
    [theme.breakpoints.down('xs')]: {
      width: '95%'
    },
  }
}));


export default Form;
