// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract CredentialVerification {
    // Structure to store student credentials
    struct Credential {
        string name;
        string registrationNumber;
        string dob;
        string passOutYear;
        string academicYear;
        string ipfsHash;
    }

    // Mapping of registration number to student credential
    mapping(string => Credential) private credentials;

    // Event for logging credential addition
    event CredentialAdded(string indexed registrationNumber, string ipfsHash);

    // Function to add student credential
    function addCredential(
        string memory _name,
        string memory _registrationNumber,
        string memory _dob,
        string memory _passOutYear,
        string memory _academicYear,
        string memory _ipfsHash
    ) public {
        // Ensure credential is not already stored
        require(bytes(credentials[_registrationNumber].registrationNumber).length == 0, "Credential already exists!");

        // Store the credential
        credentials[_registrationNumber] = Credential(_name, _registrationNumber, _dob, _passOutYear, _academicYear, _ipfsHash);

        // Emit event
        emit CredentialAdded(_registrationNumber, _ipfsHash);
    }

    // Function to retrieve credential details
    function getCredential(string memory _registrationNumber) public view returns (
        string memory name,
        string memory dob,
        string memory passOutYear,
        string memory academicYear,
        string memory ipfsHash
    ) {
        // Ensure the credential exists
            
        require(bytes(credentials[_registrationNumber].registrationNumber).length != 0, "Credential not found!");

        // Return credential details
        Credential memory cred = credentials[_registrationNumber];
        return (cred.name, cred.dob, cred.passOutYear, cred.academicYear, cred.ipfsHash);
    }
}
