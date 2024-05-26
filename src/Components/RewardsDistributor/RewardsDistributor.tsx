import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Button, Text, Box, Input, useToast } from '@chakra-ui/react';
import contractABI from './splitterABI.json'; // Use your ABI here
import nftABI from './nftABI.json'; // Use your NFT ABI here

const CONTRACT_ADDRESS = '0x88a91014AFc11533c85551379DD06F795F833CF6'; // Replace with your contract address
const NFT_ADDRESS = '0x8dF953c17Bb6bC31e3ed397df909f7C4378B1e9e'; // Replace with your NFT contract address
const TOKEN_DECIMALS = 9;
const BATCH_SIZE = 50; // Adjust batch size as necessary

const RewardsDistributor = () => {
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [tokenBalance, setTokenBalance] = useState<string>('');
  const [amountPerNFT, setAmountPerNFT] = useState<string>('');
  const { address } = useAccount();
  const toast = useToast();

  const getContractWithSigner = async () => {
    if (!window.ethereum) {
      throw new Error('No crypto wallet found. Please install it.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  };

  const getNFTContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    return new ethers.Contract(NFT_ADDRESS, nftABI, provider);
  };

  const fetchTotalSupply = async () => {
    try {
      const nftContract = await getNFTContract();
      const totalSupply: ethers.BigNumber = await nftContract.totalSupply();
      setTotalSupply(totalSupply.toNumber());
      return totalSupply;
    } catch (error) {
      console.error('Error fetching total supply:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch total supply. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const balance: ethers.BigNumber = await contract.getRewardTokenBalance();
      const formattedBalance = ethers.utils.formatUnits(balance, TOKEN_DECIMALS);
      setTokenBalance(formattedBalance);

      const totalSupplyNumber = await fetchTotalSupply();
      if (totalSupplyNumber.toNumber() > 0) {
        const balancePerNFT = balance.div(totalSupplyNumber);
        const formattedBalancePerNFT = ethers.utils.formatUnits(balancePerNFT, TOKEN_DECIMALS);
        setAmountPerNFT(formattedBalancePerNFT);
        setRewardAmount(formattedBalancePerNFT);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch token balance. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchNFTHolders = async () => {
    try {
      console.log('Fetching NFT holders...');
      const nftContract = await getNFTContract();
      const totalSupply: number = await nftContract.totalSupply().then((supply: ethers.BigNumber) => supply.toNumber());
      const holderCounts: { [key: string]: number } = {};

      const fetchPromises = [];
      for (let index = 0; index < totalSupply; index++) {
        fetchPromises.push(
          nftContract.tokenByIndex(index).then(async (tokenId: ethers.BigNumber) => {
            const owner = await nftContract.ownerOf(tokenId);
            holderCounts[owner] = (holderCounts[owner] || 0) + 1;
          })
        );
      }

      await Promise.all(fetchPromises);
      console.log('Fetched NFT holders with counts:', holderCounts);
      return holderCounts;
    } catch (error) {
      console.error('Error fetching NFT holders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch NFT holders. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return {};
    }
  };

  const batchRewardAddresses = async (holders: string[], amounts: number[]) => {
    const contract = await getContractWithSigner();

    try {
      console.log('Sending batch reward transaction...');
      const tx = await contract.batchRewardAddresses(holders, amounts, {
        gasLimit: ethers.utils.hexlify(1500000), // Adjust the gas limit as necessary
      });
      await tx.wait();
      console.log('Batch reward transaction completed:', tx);

      toast({
        title: 'Success',
        description: 'Batch rewards sent successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Error sending batch rewards:', error);
      const errorMessage = error.reason || error.data || error.message;
      toast({
        title: 'Error',
        description: `Failed to send batch rewards: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBatchRewards = async () => {
    if (!rewardAmount) {
      toast({
        title: 'Error',
        description: 'Please enter a reward amount.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    console.log('Starting batch reward process...');
    const holderCounts = await fetchNFTHolders();
    const uniqueHolders = Object.keys(holderCounts);
    const rewardAmountInt = parseFloat(rewardAmount);

    const batches = [];
    for (let i = 0; i < uniqueHolders.length; i += BATCH_SIZE) {
      const batchHolders = uniqueHolders.slice(i, i + BATCH_SIZE);
      const batchAmounts = batchHolders.map(holder => rewardAmountInt * holderCounts[holder]);
      batches.push({ holders: batchHolders, amounts: batchAmounts });
    }

    for (const batch of batches) {
      await batchRewardAddresses(batch.holders, batch.amounts);
    }
  };

  useEffect(() => {
    fetchTotalSupply();
    fetchTokenBalance();
  }, [address]);

  return (
    <Box>
      <Text fontSize="2xl" mb="4">Toast Champions Claim Processing</Text>

        <Text fontSize="md">Contract: {CONTRACT_ADDRESS}</Text>

      <Box mb="4">
      </Box>

      <Box mb="4">
      <Text fontSize="sm">Step 1: Send Toast tokens to the following Contract.</Text>
      <Text fontSize="sm">Step 2: Set the amount of Toasty Tokens to distribute to NFT Holders.</Text>
      <Text fontSize="sm">Step 3: Tap the Process Claims Button and confirm transaction.</Text>
      </Box>


      <Box mb="4">
        <Text fontSize="md">Contracts Token Balance: {tokenBalance} Toasty Tokens</Text>
        <Text fontSize="md">Total NFTs: {totalSupply}</Text>
        <Text fontSize="md">Max Toasty Amount per NFT: {amountPerNFT} Tokens</Text>
        <Input
          placeholder="Reward Amount (Whole Tokens)"
          value={rewardAmount}
          onChange={(e) => setRewardAmount(e.target.value)}
          mb="2"
          max={amountPerNFT}
        />
        <Button onClick={handleBatchRewards} textColor="white" bg="gray" _hover={{ bg: 'gray.400' }}>
          Process Claims
        </Button>
        <Text fontSize="sm">Note: You can dispurse less then max if needed.</Text>
      </Box>
    </Box>
  );
};

export default RewardsDistributor;
