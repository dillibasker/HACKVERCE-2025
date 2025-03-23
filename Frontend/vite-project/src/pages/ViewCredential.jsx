import React, { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import "../styles/ViewCredential.css";
import CredentialVerificationABI from "./CredentialVerification.json";

const contractAddress = "0xccd4DD00d95d40c381e88F4337FfD2bEBC283a93";

export default function ViewCredential() {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    studentName: "",
    dob: "",
    passOutYear: "",
    academicYear: "",
    ipfsHash: "",
  });

  const [verificationMessage, setVerificationMessage] = useState("");
  const [verifiedData, setVerifiedData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const normalizeIpfsHash = (hash) => {
    return hash.startsWith("https://gateway.pinata.cloud/ipfs/")
      ? hash.replace("https://gateway.pinata.cloud/ipfs/", "")
      : hash;
  };

  const verifyCredential = async () => {
    if (!window.ethereum) {
      setVerificationMessage("Please install MetaMask!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, CredentialVerificationABI, provider);
      
      const result = await contract.getCredential(formData.registrationNumber.trim());
      if (!result || result.length === 0) {
        setVerificationMessage("Credential not found.");
        return;
      }

      const blockchainData = {
        name: result[0],
        dob: result[1],
        passOutYear: result[2],
        academicYear: result[3],
        ipfsHash: result[4],
      };

      console.log("User Input:", formData);
      console.log("Blockchain Data:", blockchainData);

      if (
        formData.studentName.toLowerCase() === blockchainData.name.toLowerCase() &&
        formData.dob === blockchainData.dob &&
        formData.passOutYear === blockchainData.passOutYear &&
        formData.academicYear === blockchainData.academicYear &&
        normalizeIpfsHash(formData.ipfsHash) === normalizeIpfsHash(blockchainData.ipfsHash)
      ) {
        setVerificationMessage("✅ Credential Verified Successfully!");
        setVerifiedData(blockchainData);
      } else {
        setVerificationMessage("❌ Credential Mismatch!");
        setVerifiedData(null);
      }
    } catch (err) {
      console.error("Error fetching credential:", err);
      setVerificationMessage("⚠️ Credential not found or an error occurred.");
      setVerifiedData(null);
    }
  };

  return (
    <motion.div className="view-credential-container">
      <h2>Verify Credential</h2>

      <div className="form-group">
        <label>Registration Number</label>
        <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Student Name</label>
        <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Date of Birth</label>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Pass Out Year</label>
        <input type="text" name="passOutYear" value={formData.passOutYear} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Academic Year</label>
        <input type="text" name="academicYear" value={formData.academicYear} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>IPFS Hash</label>
        <input type="text" name="ipfsHash" value={formData.ipfsHash} onChange={handleChange} required />
      </div>

      <motion.button onClick={verifyCredential} className="submit-button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        Verify Credential
      </motion.button>

      {verificationMessage && <p className="verification-message">{verificationMessage}</p>}
      {verifiedData && (
        <div className="credential-card">
          <p><strong>Name:</strong> {verifiedData.name}</p>
          <p><strong>Date of Birth:</strong> {verifiedData.dob}</p>
          <p><strong>Pass Out Year:</strong> {verifiedData.passOutYear}</p>
          <p><strong>Academic Year:</strong> {verifiedData.academicYear}</p>
          <p>
            <strong>Certificate:</strong> 
            <a href={`https://ipfs.io/ipfs/${normalizeIpfsHash(verifiedData.ipfsHash)}`} target="_blank" rel="noopener noreferrer">
              View Certificate
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
}
