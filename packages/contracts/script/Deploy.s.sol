// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.29 <0.9.0;

import {Script} from "forge-std/src/Script.sol";
import {console2} from "forge-std/src/console2.sol";
import {EnvRegistry} from "../src/environment_receipt.sol";

/// @notice Deploys EnvRegistry and optionally registers an environment.
/// Env vars (all optional, but useful for one-shot registration):
///  - ENV_ID, REPO_URL, ENV_PATH, COMMIT_HASH, METADATA_CID
contract Deploy is Script {
    function run() external returns (EnvRegistry reg, address registryAddr) {
        // Read params from environment
        string memory envId = vm.envOr("ENV_ID", string(""));
        string memory repoUrl = vm.envOr("REPO_URL", string(""));
        string memory envPath = vm.envOr("ENV_PATH", string(""));
        string memory commitHash = vm.envOr("COMMIT_HASH", string(""));
        string memory metadataCID = vm.envOr("METADATA_CID", string(""));

        uint256 deployerKey = vm.envUint("DEPLOYER_KEY");
        vm.startBroadcast(deployerKey);
        reg = new EnvRegistry();
        registryAddr = address(reg);

        // If ENV_ID provided, perform initial registration in the same tx sequence
        if (bytes(envId).length > 0) {
            reg.registerEnvironment(envId, repoUrl, envPath, commitHash, metadataCID);
        }
        vm.stopBroadcast();

        console2.log("EnvRegistry deployed at:", registryAddr);
        if (bytes(envId).length > 0) {
            console2.log("Registered envId:", envId);
        }
    }
}
