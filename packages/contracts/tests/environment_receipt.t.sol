// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.29 <0.9.0;

import {Test} from "forge-std/src/Test.sol";
import {console2} from "forge-std/src/console2.sol";
import {} from "../src/environment_receipt.sol";
import {EnvRegistry} from "../src/environment_receipt.sol";

contract EnvRegistryTest is Test {
    EnvRegistry internal reg;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    // Mirror events for expectEmit
    event EnvironmentRegistered(string envId, string repoUrl, string envPath, string commitHash, string metadataCID, address owner);
    event RunSubmitted(string envId, string runId, address runner, uint256 score, bytes32 artifactsHash, bytes32 configHash, address verifier);

    function setUp() public virtual {
        reg = new EnvRegistry();
    }

    function test_registerEnvironment_setsStorageAndEmits(string memory envId, string memory repoUrl, string memory envPath, string memory commitHash, string memory metadataCID) public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true, address(reg));
        emit EnvironmentRegistered(envId, repoUrl, envPath, commitHash, metadataCID, alice);
        reg.registerEnvironment(envId, repoUrl, envPath, commitHash, metadataCID);
        (
            string memory rRepo,
            string memory rPath,
            string memory rCommit,
            string memory rCid,
            address rOwner
        ) = reg.environments(envId);

        assertEq(rRepo, repoUrl, "repoUrl");
        assertEq(rPath, envPath, "envPath");
        assertEq(rCommit, commitHash, "commitHash");
        assertEq(rCid, metadataCID, "metadataCID");
        assertEq(rOwner, alice, "owner");
    }

    function test_submitRun_emitsEvent(string memory envId, string memory runId, bytes32 artifactsHash, bytes32 configHash, uint256 score, address verifier, bytes memory verifierSig) public {
        bytes32 artifactsHash = keccak256(abi.encodePacked("results.json"));
        bytes32 configHash = keccak256(abi.encodePacked("config"));
        uint256 score = 87;
        address verifier = address(0x123456);
        bytes memory verifierSig = hex""; // optional

        vm.prank(bob);
        vm.expectEmit(true, true, true, true, address(reg));
        emit RunSubmitted(envId, runId, bob, score, artifactsHash, configHash, verifier);
        reg.submitRun(envId, runId, artifactsHash, configHash, score, verifier, verifierSig);
    }
}
