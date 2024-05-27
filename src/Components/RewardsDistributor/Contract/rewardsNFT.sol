// SPDX-License-Identifier: MIT

/*
MAINNET ADDRESSES HERE


BSC Mainnet 0x466cc282a58333F3CD94690a520b5aFAD30506cD nfts
BSC Mainnet 0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14 token
BSC Mainnet 18 Decimals
*/

/*
TESTNET ADDRESSES HERE
CONTRACT WORKING AND TESTED 0xa2092e8BFD818624C5b8EAd12464538C5067e401

bsctestnet 0x8dF953c17Bb6bC31e3ed397df909f7C4378B1e9e test  nfts
bsctestnet 0x0459b48E5887b6e87a4e1c4F1eE614dBB13EFa23 test  token
bsctestnet 9 _rewardTokenDecimals
*/

pragma solidity 0.8.19;

import "@openzeppelin/contracts@4.5.0/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@4.5.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.5.0/security/ReentrancyGuard.sol";



contract ToastChampionRewards is Ownable, ReentrancyGuard {
    uint8 public rewardTokenDecimals;

    IERC721Enumerable public nft;
    IERC20 public rewardToken;
    uint256 public totalAllocatedRewards;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public claimedRewards;

    event RewardWithdrawn(address indexed holder, uint256 amount);
    event ERC20Recovered(address tokenAddress, uint256 tokenAmount);
    event NativeTokenRecovered(uint256 amount);
    event RewardDirectlySent(address indexed recipient, uint256 amount);

    constructor(address _nft, address _rewardToken, uint8 _rewardTokenDecimals) {
        nft = IERC721Enumerable(_nft);
        rewardToken = IERC20(_rewardToken);
        rewardTokenDecimals = _rewardTokenDecimals;
    }

    function claimRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to withdraw");

        rewards[msg.sender] = 0;
        claimedRewards[msg.sender] += reward;
        require(rewardToken.transfer(msg.sender, reward), "Transfer failed");
        emit RewardWithdrawn(msg.sender, reward);
    }

    function hasRewardsToClaim(address addr) external view returns (bool) {
        return rewards[addr] > 0;
    }

    function batchRewardAddresses(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        uint256 totalAmount = 0;

        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i] * (10 ** uint256(rewardTokenDecimals));
        }

        require(rewardToken.balanceOf(address(this)) >= totalAmount, "Insufficient rewards in the contract");

        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 amountInWei = amounts[i] * (10 ** uint256(rewardTokenDecimals));
            rewards[recipients[i]] += amountInWei;
            totalAllocatedRewards += amountInWei;
            emit RewardDirectlySent(recipients[i], amountInWei);
        }
    }

    function getRewardTokenBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }

    function getTotalAllocatedRewards() external view returns (uint256) {
        return totalAllocatedRewards;
    }


    function getClaimedRewards(address addr) external view returns (uint256) {
        return claimedRewards[addr];
    }

    function getTotalUnallocatedTokens() external view returns (uint256) {
        uint256 balance = rewardToken.balanceOf(address(this));
        uint256 unallocated = balance - totalAllocatedRewards;
        return unallocated;
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        require(IERC20(tokenAddress).transfer(owner(), tokenAmount), "Transfer failed");
        emit ERC20Recovered(tokenAddress, tokenAmount);
    }

    function recoverNativeToken(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
        emit NativeTokenRecovered(amount);
    }

    receive() external payable {}

    fallback() external payable {}
}
