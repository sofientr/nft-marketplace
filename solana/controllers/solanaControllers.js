const shortId = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const solanaBufferLayout = require('@solana/buffer-layout');
const mzfs = require('mz/fs')
const fs = require('fs').promises;
const path = require('path');
const borsh = require('borsh');
const BufferLayout = require('buffer-layout');
const {parse, stringify, toJSON, fromJSON} = require('flatted');
const { token } = require("morgan");

let KEYPAIR_PATH = path.resolve(__dirname, './keypair.json');
let connection, spl_Token;
// let deployedProgramId = 'JBfHhrGguwdaemUzDsYHdPCqc3ugsMY7goqCKGzifkKU'
// let deployedProgramId = '35AVt1QbDfFTP3xWkMo3QhdJSvbBL31rnCyGXN2g76VA'
// let deployedProgramId = 'BP6iWVRjPhqf2LyJJvV3wUDLMMuaHpQfRFBsSx8FAcUp'

let deployedProgramId = splToken.TOKEN_PROGRAM_ID.toBase58();

let Metadata  = class {
  TokenID = '';
  name = '';
  symbol = '';
  uri = '';
  holder = '';

  constructor(
    TokenID,
    name,
    symbol,
    uri,
    holder
  ) {
    
      this.TokenID = TokenID;
      this.name = name;
      this.symbol = symbol;
      this.uri = uri;
      this.holder = holder;
    
  }
}

let establishConnection = async () => {
  // Connect to cluster
  connection = new web3.Connection(
    web3.clusterApiUrl('devnet'),
    'confirmed',
  );
}

let createKeypairFromFile = async (filePath) => {


  // console.log('filePath',filePath);
  let secretK = await mzfs.readFile(filePath, {
    encoding: 'utf8'
  });
  //  console.log('secretK',secretK);

  //  return web3.Keypair.fromSeed(secretK)
  const secretKey = Uint8Array.from(JSON.parse(secretK));
  // console.log('file creation',secretKey);
  return web3.Keypair.fromSecretKey(secretKey);
}



// user signup
exports.createWallet = async (req, res) => {
  await establishConnection();

  var wallet = web3.Keypair.generate();

  res.json({
    'wallet': wallet
  });
};



exports.deploySmartContract = async (req, res) => {


  await establishConnection();

  let marketplaceWallet = await createKeypairFromFile(KEYPAIR_PATH);

  // await connection.requestAirdrop(marketplaceWallet.publicKey, 1000000000);
  let data_path = path.resolve(__dirname, '../rust/dist/dhia_spl_token.so');
  let data;
try{

  data = await fs.readFile(data_path);
}
catch(err){
  console.log(err);
}

  const programAccount = new web3.Account();

  await web3.BpfLoader.load(

    connection,

    marketplaceWallet,

    programAccount,

    data,

    web3.BPF_LOADER_PROGRAM_ID,

  );

  const programId = programAccount.publicKey;

  console.log('Program loaded to account', programId.toBase58());

  const appAccount = new web3.Account();

  const appPubkey = appAccount.publicKey;

  console.log('Creating app account', appPubkey.toBase58());

  const MetaDataSchema = new Map([
    [Metadata, { kind: 'struct', fields: [['TokenID', 'String'], ['name', 'String'], ['symbol', 'String'], ['uri', 'String'], ['holder', 'String'],] }],
  ]);
  let nft = new Metadata();
  nft.TokenID = '2JNSCRCJZDKBK4T8WV32YhU6KtQh3etbPY55yw5bjNz1'
  nft.name = ''
  nft.symbol = ''
  nft.uri = 'https://gateway.pinata.cloud/ipfs/QmbsguXvG1mxSznFcuHAzrf1ifkgPwgd6DxUX9q3Xikdad'
  nft.holder = 'FNaEuH7vmoeitP3yKGAa3R5UTMpo1Xkj5bd84JjtG78f'
  const GREETING_SIZE = borsh.serialize(
    MetaDataSchema,
    nft,
  ).length;

  
  
  const lamports = 5000000000;

  const transaction = new web3.Transaction().add(

    web3.SystemProgram.createAccount({

      fromPubkey: marketplaceWallet.publicKey,

      newAccountPubkey: appPubkey,

      lamports,

      space: solanaBufferLayout.span,

      programId,

    }),

  );

  let resp = await web3.sendAndConfirmTransaction(

    connection,

    transaction,

    [marketplaceWallet, appAccount],

    {

      commitment: 'singleGossip',

      preflightCommitment: 'singleGossip',

    },

  );

  console.log('resp', resp);

  res.json({
    'programId': programId.toBase58(),
    'appAccount': appPubkey.toBase58(),
    'resp': resp
  });
};

exports.connectWallet = async (req, res) => {


  res.json({
    time: Date().now()
  });
};


exports.mint = async (req, res) => {

  console.log('KEYPAIR_PATH', KEYPAIR_PATH);

  let walletPK = new web3.PublicKey(req.body.walletPK);
  // console.log('walletPK', walletPK);

  await establishConnection();

  let marketplaceWallet = await createKeypairFromFile(KEYPAIR_PATH);
  // console.log('marketplaceWallet',marketplaceWallet);



  // web3.Tokebn. .createInitMintInstruction(
  //   TOKEN_PROGRAM_ID,
  //   account,
  //   decimals,
  //   owner,
  //   freezeAuthority,
  // ),
  // );

  let mint = await splToken.Token.createMint(
    connection,
    marketplaceWallet,
    marketplaceWallet.publicKey,
    null,
    0,
    splToken.TOKEN_PROGRAM_ID,
  );



  //minting 1 new token to the "fromTokenAccount" account we just returned/created
  let userTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    walletPK,
  );

  await mint.mintTo(
    userTokenAccount.address,
    marketplaceWallet.publicKey,
    [],
    1,
  );

  // await splToken.Token. .setAuthority(
  //   mint.address,
  //   walletPK,
  //   )
  // web3.accoun

  res.json({
    'token': userTokenAccount.address.toBase58()
  });
};



const MintLayout = BufferLayout.struct([
  BufferLayout.u32('mintAuthorityOption'),
  BufferLayout.blob(32,'mintAuthority'),
  BufferLayout.nu64('supply'),
  BufferLayout.u8('decimals'),
  BufferLayout.u8('isInitialized'),
  BufferLayout.u32('freezeAuthorityOption'),
  BufferLayout.blob(32,'freezeAuthority'),
]);

 let getAssociatedTokenAddress = async(
  associatedProgramId,
  programId,
  mint,
  owner,
  allowOwnerOffCurve = false,
) => {
  if (!allowOwnerOffCurve && !web3.PublicKey.isOnCurve(owner.toBuffer())) {
    throw new Error(`Owner cannot sign: ${owner.toString()}`);
  }
  return (
    await web3.PublicKey.findProgramAddress(
      [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
      associatedProgramId,
    )
  )[0];
}

let createAssociatedTokenAccountInternal = async (
  owner,
  associatedAddress,
  programId,
  payer
) => {
  await web3.sendAndConfirmTransaction(
    'CreateAssociatedTokenAccount',
    connection,
    new Transaction().add(
      splToken.Token.createAssociatedTokenAccountInstruction(
        associatedProgramId,
        programId,
        token.publicKey,
        associatedAddress,
        owner,
        payer.publicKey,
      ),
    ),
    this.payer,
  );

  return associatedAddress;
}


let getOrCreateAssociatedAccountInfo = async (
  owner,
  token,
  programId
  
  ) => {

    const associatedAddress = await getAssociatedTokenAddress(
      splToken.associatedProgramId,
      programId,
      token.publicKey,
      owner,
    );
    console.log('associatedAddress in function ',associatedAddress.toBase58());
    
    // await createAssociatedTokenAccountInternal(
    //   owner,
    //   associatedAddress,
    // );

    return associatedAddress;
}

exports.createMint = async (req, res) => {

  console.log('KEYPAIR_PATH', KEYPAIR_PATH);
try {
  

  let userWalletPK = new web3.PublicKey(req.body.walletPK);
  // console.log('walletPK', walletPK);

  await establishConnection();

  const mintAccount = web3.Keypair.generate();
  let marketplaceWallet = await createKeypairFromFile(KEYPAIR_PATH);

  const balanceNeeded = await splToken.Token.getMinBalanceRentForExemptMint(
    connection,
  );
  

  //wait for airdrop confirmation


  // let tokenPK = await web3.publicKey.generate();
  let myProgramId = splToken.TOKEN_PROGRAM_ID;
  const transaction = new web3.Transaction();


  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: userWalletPK,
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
      userWalletPK,
      userWalletPK,
    ),
  );

  transaction.feePayer = userWalletPK;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

  transaction.sign(mintAccount);


  let transaction2 = new web3.Transaction();

  let tokenAssocietedAccount = await splToken.Token.getAssociatedTokenAddress(
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    splToken.TOKEN_PROGRAM_ID,
    mintAccount.publicKey,
    userWalletPK
  );

  transaction2.add(
    splToken.Token.createAssociatedTokenAccountInstruction(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      tokenAssocietedAccount,
      userWalletPK,
      userWalletPK

    ));

    transaction2.add(
      splToken.Token.createMintToInstruction(
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        userWalletPK,
        [],
        1,
      )
    );

    transaction2.feePayer = userWalletPK;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;


  res.json({
    'transaction1': transaction,
    // 'transaction2': transaction2,
    'token': myToken.publicKey.toBase58()
  });
} catch (error) {
  console.log(error);
  res.json({
    'error': error
  })
}
};

exports.createCustomMint = async (req, res) => {

  console.log('KEYPAIR_PATH', KEYPAIR_PATH);
try {
  

  let userWalletPK = new web3.PublicKey(req.body.walletPK);
  let contractAdress = new web3.PublicKey(req.body.contractAdress);
  // console.log('walletPK', walletPK);

  await establishConnection();

  const mintAccount = web3.Keypair.generate();
  let marketplaceWallet = await createKeypairFromFile(KEYPAIR_PATH);

  const balanceNeeded = await splToken.Token.getMinBalanceRentForExemptMint(
    connection,
  );
  

  //wait for airdrop confirmation


  // let tokenPK = await web3.publicKey.generate();
  let myProgramId = new web3.PublicKey(contractAdress);

  const transaction = new web3.Transaction();


  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: userWalletPK,
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
      userWalletPK,
      userWalletPK,
    ),
  );

  transaction.feePayer = userWalletPK;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;

  transaction.sign(mintAccount);


  let transaction2 = new web3.Transaction();

  let tokenAssocietedAccount = await splToken.Token.getAssociatedTokenAddress(
    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
    splToken.TOKEN_PROGRAM_ID,
    mintAccount.publicKey,
    userWalletPK
  );

  transaction2.add(
    splToken.Token.createAssociatedTokenAccountInstruction(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      mintAccount.publicKey,
      tokenAssocietedAccount,
      userWalletPK,
      userWalletPK

    ));

    transaction2.add(
      splToken.Token.createMintToInstruction(
        myProgramId,
        mintAccount.publicKey,
        tokenAssocietedAccount,
        userWalletPK,
        [],
        1,
      )
    );

    transaction2.feePayer = userWalletPK;
    transaction2.recentBlockhash = (
      await connection.getRecentBlockhash()
    ).blockhash;


  res.json({
    'transaction1': transaction,
    // 'transaction2': transaction2,
    'token': myToken.publicKey.toBase58()
  });
} catch (error) {
  console.log(error);
  res.json({
    'error': error
  })
}
};

exports.mintByMyContract1 = async (req, res) => {

  console.log('KEYPAIR_PATH', KEYPAIR_PATH);
try {
  

  let userWalletPK = new web3.PublicKey(req.body.walletPK);
  // console.log('walletPK', walletPK);

  await establishConnection();

  const mintAccount = web3.Keypair.generate();
  let marketplaceWallet = await createKeypairFromFile(KEYPAIR_PATH);
  let myProgramId = new web3.PublicKey(deployedProgramId);

  const balanceNeeded = await splToken.Token.getMinBalanceRentForExemptMint(
    connection,
  );
  

  //wait for airdrop confirmation


  // let tokenPK = await web3.publicKey.generate();
  let programId = splToken.TOKEN_PROGRAM_ID;
  // let myToken = new splToken.Token(
  //   connection ,
  //   mintAccount.publicKey,
  //   myProgramId,
  //   marketplaceWallet
  // )


  // console.log("associated prog address",splToken.ASSOCIATED_TOKEN_PROGRAM_ID.toBase58());
  // console.log("mytoken associated prog address",myToken.associatedProgramId.toBase58());

  const transaction = new web3.Transaction();

  transaction.add(
    web3.SystemProgram.createAccount({
      fromPubkey: userWalletPK,
      newAccountPubkey: mintAccount.publicKey,
      lamports: balanceNeeded,
      space: splToken.MintLayout.span,
      programId:myProgramId,
    }),
  );

  transaction.add(
    splToken.Token.createInitMintInstruction(
      myProgramId,
      mintAccount.publicKey,
      0,
      userWalletPK,
      userWalletPK,
    ),
  );

// let tokenAssocietedAccount = web3.Keypair.fromSeed(mintAccount.publicKey.toBytes()); 
// let tokenAssocietedAccount = web3.Keypair.generate(); 

  // transaction.add(
  //   splToken.Token.createInitAccountInstruction(
  //     myProgramId,
  //     myToken.publicKey,
  //     mintAccount.publicKey,
  //     marketplaceWallet.publicKey,
  //   ),
  // );

  // transaction.add(
  //   splToken.Token.createAssociatedTokenAccountInstruction(
  //     splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
  //     myProgramId,
  //     myToken.publicKey,
  //     tokenAssocietedAccount.publicKey,
  //     userWalletPK,
  //     userWalletPK,
  //   ),
  // );

  // let fromTokenAccount = await myToken.createAssociatedTokenAccount(
  //   marketplaceWallet.publicKey,
  // );


  // console.log('fromTokenAccount', fromTokenAccount.toBase58());
  // transaction.add(
  //   splToken.Token.createMintToInstruction(
  //     myProgramId,
  //     myToken.publicKey,
  //     fromTokenAccount.address,
  //     // marketplaceWallet.publicKey,
  //     marketplaceWallet.publicKey,
  //     [],
  //     1,
  //   )
  //   )
    // console.log('token',myToken.publicKey.toBase58());

  let signature = await web3.sendAndConfirmTransaction(
    
    connection,
    transaction,
    [marketplaceWallet, mintAccount],
    {skipPreflight: false,}
  );

  const transaction2 = new web3.Transaction();




  let customTokenAssocietedAccount = await getOrCreateAssociatedAccountInfo(
    marketplaceWallet.publicKey,
    mintAccount.publicKey,
    myProgramId,

  );

  console.log('custom tokenAssocietedAccount :  ',customTokenAssocietedAccount.toBase58());
  console.log('#'.repeat(12));
/*
// let tokenAssocietedAccount = await myToken.getOrCreateAssociatedAccountInfo(
//   marketplaceWallet.publicKey,
// )

// console.log('tokenAssocietedAccount web3',tokenAssocietedAccount.address.toBase58());
// console.log('#'.repeat(12));


  transaction2.add(
    splToken.Token.createMintToInstruction(
      myProgramId,
      mintAccount.publicKey,
      customTokenAssocietedAccount,
      marketplaceWallet.publicKey,
      [],
      1,
    )
    )
    console.log('token',myToken.publicKey.toBase58());
    let signature2 = await web3.sendAndConfirmTransaction(
      connection,
      transaction2,
      [marketplaceWallet,mintAccount],
      {skipPreflight: false,}
    );
*/
  // web3.realSendAndConfirmTransaction(connection, transaction, signers, {
  //   skipPreflight: false,
  // });

console.log('signature',signature);
console.log('#'.repeat(12));
// console.log('signature2',signature2);
console.log('#'.repeat(12));

// console.log('token',myToken.publicKey.toBase58());

    // transaction.feePayer =userWalletPK;

// transaction.recentBlockhash = (
//   await connection.getRecentBlockhash()
// ).blockhash;
// transaction.sign(mintAccount);


  res.json({
    'transaction': transaction,
    'token': myToken.publicKey.toBase58()
  });
} catch (error) {
  console.log(error);
  res.json({
    'error': error
  })
}
};


