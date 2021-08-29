import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Header from "./component/Header";
import SignUP from "./pages/SignUp";
import Signin from "./pages/SignIn";
import HomeAdmin from "./component/admin/index";
import Solana from "./component/solana/solana";
import Protected from "./component/private/Protected";
import Mint from "./pages/Mint";
import { min } from 'lodash';
import ExternelMint from './pages/ExternelMint';
import  Form from "./pages/TronPages/Form.js";
import  Contract from "./pages/TronPages/Contract";
function App() {
  const [darkMode, setDarkMode] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [contract_1155, setContract_1155] = useState(null);
  const [contract_721, setContract_721] = useState(null);
  const [signerAddress, setSignerAddress] = useState("");
  const [networkId, setNetworkId] = useState('')
  return (
    <div className="App">
      <Router>
        <Header                  signerAddress={signerAddress}
          contract_1155={contract_1155}
          contract_721={contract_721}
          setContract_1155={setContract_1155}
          setContract_721={setContract_721}
          setSignerAddress={setSignerAddress}
          setNetworkId={setNetworkId} />
        <Protected />
        <Switch>
          <Route path="/signup" component={SignUP} exact />
          <Route path="/signin" component={Signin} exact />
          <Route path="/admin" component={HomeAdmin} exact />
          <Route path="/solana" component={Solana} exact />
          <Route path="/form" component={Form} exact />
          <Route path="/contract" component={Contract} exact />
          {/* <Route path="/solana"  exact  >
            <Solana
            isMobile={isMobile}
            contract_1155={contract_1155}
            contract_721={contract_721}
            networkId={networkId} 
            />
          </Route> */}
          <Route path="/polygon" exact   >
            <Mint         
          isMobile={isMobile}
          signerAddress={signerAddress}
          contract_1155={contract_1155}
          contract_721={contract_721}
          networkId={networkId}  />
            </Route>
            <Route path="/externalMint" exact   >
            <ExternelMint         
          isMobile={isMobile}
          signerAddress={signerAddress}
          contract_1155={contract_1155}
          contract_721={contract_721}
          networkId={networkId}  />
            </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
