import axios from 'axios'
import * as web3 from "@solana/web3.js"

const url = 'http://localhost:5000';
// const url = process.env.REACT_APP_NODE_APP_URL;
// console.log('process.env.REACT_APP_NODE_APP_URL');
// console.log(process.env);
// console.log(process.env.PUBLIC_URL);


const urll = 'http://localhost:5008';
const API = axios.create();

// products
export const mintNFT = (data:any)=> axios.post(`/api/mint`,data);
export const mintMyNFT = (data:any)=> axios.post(`/api/mintMyNFT`,data);
export const createWallet = () => axios.get(`/api/createWallet`);
// export const fetchProductById = (id)=> axios.get(`/products/${id}`);
// export const createProduct = (newProduct)=> axios.post(`/products`, newProduct);
// export const updateProduct = (id, updatedProduct) => axios.patch(`/products/${id}`, updatedProduct);