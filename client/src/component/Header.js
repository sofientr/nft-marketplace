import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { isAuth, signout } from "../action/authAcation";
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink, NavbarText
} from "reactstrap";
import { withRouter } from "react-router-dom";
import ConnectWallet from "./ConnectWallet";
import Wallet from "./TronComponent/Wallet";


const Header = ({ history, signerAddress, contract_1155, contract_721, setContract_1155, setContract_721, setSignerAddress, setNetworkId}) => {
import { Button } from "@material-ui/core";

const Header = ({ history, signerAddress, contract_1155, contract_721, setContract_1155, setContract_721, setSignerAddress, setNetworkId,setSolanaWalletPK }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div>
      <Navbar color="light" light expand="md">
        <Link to="/">
          <NavbarBrand
            style={{ cursor: "pointer" }}
            className="font-weight-bold"
          >
            LOGO HERE
          </NavbarBrand>
        </Link>
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className="ml-auto" navbar>
            {!isAuth() && (
              <React.Fragment>
                <NavItem>
                  <Link to="/signup">
                    <NavLink style={{ cursor: "pointer" }}>Signup</NavLink>
                  </Link>
                </NavItem>
                <NavItem>
                  <Link to="/signin">
                    <NavLink style={{ cursor: "pointer" }}>Signin</NavLink>
                  </Link>
                </NavItem>
              </React.Fragment>
            )}

            {isAuth() && isAuth().role === 0 && window.solana?.isConnected &&(
              <NavItem>
                <Link to="/solana">
                  <NavLink style={{ cursor: "pointer" }}>mint NFT on Solana</NavLink>
                </Link>
              </NavItem>
            )}

            {isAuth() && isAuth().role === 0 && (
              <NavItem>
                <Link to="/polygon">
                  <NavLink style={{ cursor: "pointer" }}>mint NFT on Polygon </NavLink>
                </Link>
              </NavItem>
            )}
            {isAuth() && isAuth().role === 0 && (
              <NavItem>
                <Link to="/externalMint">
                  <NavLink style={{ cursor: "pointer" }}>external mint on Polygon </NavLink>
                </Link>
              </NavItem>
            )}
             {isAuth() && isAuth().role === 0 && (
              <NavItem>
                <Link to="/form">
                  <NavLink style={{ cursor: "pointer" }}>mint NFT on Tron </NavLink>
                </Link>
              </NavItem>
            )}
            {isAuth() && isAuth().role === 0 && (
              <NavItem>
                <Link to="/contract">
                  <NavLink style={{ cursor: "pointer" }}>external mint on Tron </NavLink>
                </Link>
              </NavItem>
            )}


            {isAuth() && isAuth().role === 1 && (
              <NavItem>
                <Link to="/admin">
                  <NavLink style={{ cursor: "pointer" }}>{`${isAuth().name
                    }'s Dashboard`}</NavLink>
                </Link>
              </NavItem>
            )}


          </Nav>

        </Collapse>
        <NavbarText>          
          {isAuth() && isAuth().role === 0 && 
          <ConnectWallet
          signerAddress={signerAddress}
          contract_1155={contract_1155}
          contract_721={contract_721}
          setContract_1155={setContract_1155}
          setContract_721={setContract_721}
          setSignerAddress={setSignerAddress}
          setNetworkId={setNetworkId}
        />}</NavbarText>

<NavbarText>          {isAuth() && isAuth().role === 0 && <Wallet
        
        />}</NavbarText>
        
     

        <NavbarText> 
          <Button variant="contained" color="primary"
            onClick={async ()=>{
              if (window.solana && window.solana.isPhantom ) {
                
                if(!window.solana.isConnected){

                  await window.solana?.connect();
                  setSolanaWalletPK(window.solana?.publicKey?.toString())
                }else {
                  await window.solana.disconnect();
                  setSolanaWalletPK('');
                  history.push('/') 

                }
                   
                return window
              }
              let confirmed = window.confirm("You dont have a wallet! \n Do you want to install Phantom wallet?");
              if (confirmed) { window.open("https://phantom.app/", "_blank") }
              else { 
                history.push('/') }
            }}
          >{window.solana?.isConnected? 'Disconnect Phantom':'Connect Phantom'}</Button>         
        </NavbarText>


        {isAuth() && (
          <NavItem>
            <NavLink
              style={{ cursor: "pointer" }}
              onClick={() => signout(() => history.push("/signin"))}
            >
              SignOut
            </NavLink>
          </NavItem>
        )}

      </Navbar>
    </div>
  );
};

export default withRouter(Header);
