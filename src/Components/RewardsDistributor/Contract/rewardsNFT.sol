// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

// 0xd4b7bACE3Be6A9ad92A635FA44bFF5Bd14e6De3b

/*

bsctestnet 0x0459b48E5887b6e87a4e1c4F1eE614dBB13EFa23 test token
bsctestnet 0x8dF953c17Bb6bC31e3ed397df909f7C4378B1e9e test  nfts

*/


import "@openzeppelin/contracts@4.5.0/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts@4.5.0/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts@4.5.0/access/Ownable.sol";
import "@openzeppelin/contracts@4.5.0/security/ReentrancyGuard.sol";


contract Alpha7NFTRewardDistributor is Ownable, ReentrancyGuard {
    IERC721Enumerable public nft;
    uint256 public totalRewards;
    uint256 public rewardPerToken;
    mapping(address => uint256) public rewards;
    mapping(uint256 => bool) public processed;

    event RewardsDeposited(uint256 amount);
    event RewardsCalculated(uint256 rewardPerToken);
    event RewardsDistributed(uint256 startTokenId, uint256 endTokenId);
    event RewardWithdrawn(address indexed holder, uint256 amount);
    event ERC20Recovered(address tokenAddress, uint256 tokenAmount);
    event ETHRecovered(uint256 amount);

    constructor(address _nft) {
        nft = IERC721Enumerable(_nft);
    }

    // Fallback function to accept ETH
    receive() external payable {
        totalRewards += msg.value;
        emit RewardsDeposited(msg.value);
    }

    // Function to deposit rewards into the contract
    function depositRewards() external payable onlyOwner {
        require(msg.value > 0, "No rewards to deposit");
        totalRewards += msg.value;
        emit RewardsDeposited(msg.value);
    }

    // Function to calculate reward per token
    function calculateRewards() public onlyOwner {
        uint256 totalSupply = nft.totalSupply();
        require(totalSupply > 0, "No NFTs minted");

        rewardPerToken = totalRewards / totalSupply;
        emit RewardsCalculated(rewardPerToken);
    }

    // Function to distribute rewards to NFT holders in batches
    function distributeRewards(uint256 startTokenId, uint256 batchSize) external onlyOwner {
        uint256 totalSupply = nft.totalSupply();
        require(startTokenId < totalSupply, "Start token ID out of range");

        uint256 endTokenId = startTokenId + batchSize;
        if (endTokenId > totalSupply) {
            endTokenId = totalSupply;
        }

        for (uint256 tokenId = startTokenId; tokenId < endTokenId; tokenId++) {
            if (!processed[tokenId]) {
                address holder = nft.ownerOf(tokenId);
                rewards[holder] += rewardPerToken;
                processed[tokenId] = true;
            }
        }

        emit RewardsDistributed(startTokenId, endTokenId);
    }

    // Function to withdraw rewards for an NFT holder
    function withdrawRewards() external nonReentrant {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "No rewards to withdraw");

        rewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        emit RewardWithdrawn(msg.sender, reward);
    }

    // Function to recover ERC20 tokens sent to the contract
    function recoverERC20(address tokenAddress, uint256 tokenAmount) external onlyOwner {
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
        emit ERC20Recovered(tokenAddress, tokenAmount);
    }

    // Function to recover native currency sent to the contract
    function recoverETH(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
        emit ETHRecovered(amount);
    }
}
