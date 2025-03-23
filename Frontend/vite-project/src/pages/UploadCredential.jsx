import React, { useState } from "react";
import { ethers } from "ethers";
import CredentialVerificationABI from "./CredentialVerification.json"; // Import ABI JSON file

const CONTRACT_ADDRESS = "0xccd4DD00d95d40c381e88F4337FfD2bEBC283a93";

export default function UploadCredential() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    dob: "",
    passOutYear: "",
    academicYear: "",
  });

  const uploadToIPFS = async (file) => {
    if (!file) return alert("Please select a file!");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4ZmEzNjU0Yi0xY2E4LTRlM2UtOTA5Ny00Mzc5YjY4YjY0NjkiLCJlbWFpbCI6ImRpbGxpYmFza2VyMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiODNkNzU3YzU0ZTg0NGU3ZDhiNzgiLCJzY29wZWRLZXlTZWNyZXQiOiIzOThiMjI3YWVjZGUwOWQ5NmFmNDM2NDYzZGYwMjg3YTliNGIwNWMyMGY0ZGI1NjljMGUyZTIzYzkwOTBhOWUzIiwiZXhwIjoxNzc0MjE1NzE3fQ.nl9vKaFLg4BR0VUzN8GqazYNJQs4bN45INsgGC7W9ro`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload to IPFS");

      const data = await response.json();
      console.log("Uploaded IPFS Hash:", data.IpfsHash);
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (error) {
      console.error("IPFS Upload Error:", error);
      alert("IPFS upload failed!");
      return null;
    }
  };

  const storeOnBlockchain = async () => {
    if (!window.ethereum) return alert("Please install MetaMask!");

    try {
      const ipfsHash = await uploadToIPFS(file);
      if (!ipfsHash) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CredentialVerificationABI, signer);

      const tx = await contract.addCredential(
        formData.name,
        formData.regNo,
        formData.dob,
        formData.passOutYear,
        formData.academicYear,
        ipfsHash
      );

      await tx.wait();
      alert("Credential stored on blockchain!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Failed to store on blockchain!");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Decentralized Credential Verification</h2>

      <input type="text" name="name" placeholder="Student Name" onChange={handleChange} required />
      <input type="text" name="regNo" placeholder="Registration Number" onChange={handleChange} required />
      <input type="date" name="dob" placeholder="Date of Birth" onChange={handleChange} required />
      <input type="text" name="passOutYear" placeholder="Year of Pass-out" onChange={handleChange} required />
      <input type="text" name="academicYear" placeholder="Academic Year" onChange={handleChange} required />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={storeOnBlockchain}>Upload Credential</button>
    </div>
  );
}
