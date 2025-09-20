// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EnvRegistry {
    struct Environment {
        string repoUrl;
        string envPath;
        string commitHash;
        string metadataCID;
        address owner;
    }
    struct RunReceipt {
        string envId;
        string runId;
        bytes32 artifactsHash;
        bytes32 configHash;
        uint256 score;
        address runner;
        address verifier;
        bytes verifierSig; // optional
        uint256 timestamp;
    }

    mapping(string => Environment) public environments;

    event EnvironmentRegistered(string envId, string repoUrl, string envPath, string commitHash, string metadataCID, address owner);
    event RunSubmitted(string envId, string runId, address runner, uint256 score, bytes32 artifactsHash, bytes32 configHash, address verifier);

    function registerEnvironment(
        string calldata envId,
        string calldata repoUrl,
        string calldata envPath,
        string calldata commitHash,
        string calldata metadataCID
    ) external {
        environments[envId] = Environment({
            repoUrl: repoUrl,
            envPath: envPath,
            commitHash: commitHash,
            metadataCID: metadataCID,
            owner: msg.sender
        });
        emit EnvironmentRegistered(envId, repoUrl, envPath, commitHash, metadataCID, msg.sender);
    }

    function submitRun(
        string calldata envId,
        string calldata runId,
        bytes32 artifactsHash,
        bytes32 configHash,
        uint256 score,
        address verifier,
        bytes calldata verifierSig
    ) external {
        emit RunSubmitted(envId, runId, msg.sender, score, artifactsHash, configHash, verifier);
        // For hackathon scope, store primarily via events; can extend with arrays/mappings
    }
}