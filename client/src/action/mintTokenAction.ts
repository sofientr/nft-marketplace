import axios from 'axios'
import * as web3 from "@solana/web3.js"


const url = 'http://localhost:8001';
const API = axios.create();

// products
export const mintNFT = (data:any)=> axios.post(`${url}/api/createMint`,data);
export const mintNFTByMyContract = (data:any)=> axios.post(`${url}/api/mintNFTByMyContract`,data);
export const deployContract = (data:any)=> axios.post(`${url}/api/deploy`,data);
export const createWallet = () => axios.get(`${url}/api/createWallet`);
// export const fetchProductById = (id)=> axios.get(`/products/${id}`);
// export const createProduct = (newProduct)=> axios.post(`/products`, newProduct);
// export const updateProduct = (id, updatedProduct) => axios.patch(`/products/${id}`, updatedProduct);