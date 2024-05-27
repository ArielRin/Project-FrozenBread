import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Text, Box, Input, InputGroup, InputRightElement, useToast } from '@chakra-ui/react';
import contractABI from './splitterABI.json'; // Use your ABI here
import nftABI from './nftABI.json'; // Use your NFT ABI here
import erc20ABI from './erc20ABI.json'; // Use your ERC20 ABI here

const CONTRACT_ADDRESS = '0xa2092e8BFD818624C5b8EAd12464538C5067e401'; // Replace with your contract address
const NFT_ADDRESS = '0x8dF953c17Bb6bC31e3ed397df909f7C4378B1e9e'; // Replace with your NFT contract address
const ERC20_ADDRESS = '0x0459b48E5887b6e87a4e1c4F1eE614dBB13EFa23'; // Replace with your ERC20 token address
const TOKEN_DECIMALS = 9;
const BATCH_SIZE = 50; // Adjust batch size as necessary

const RewardsDistributor = () => {
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [erc20Amount, setErc20Amount] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [amountPerNFT, setAmountPerNFT] = useState<string>('');
  const [totalAllocatedRewards, setTotalAllocatedRewards] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [isValidAmount, setIsValidAmount] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [contractOwner, setContractOwner] = useState<string>('');
  const [isOwner, setIsOwner] = useState<boolean>(false);
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

  const getERC20Contract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(ERC20_ADDRESS, erc20ABI, signer);
  };

  const fetchContractOwner = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const owner = await contract.owner();
      setContractOwner(owner);
      if (owner.toLowerCase() === address?.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error fetching contract owner:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contract owner. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const fetchTotalSupply = async () => {
    try {
      const nftContract = await getNFTContract();
      const totalSupply = await nftContract.totalSupply();
      setTotalSupply(totalSupply);
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
      const balance = await contract.getRewardTokenBalance();
      setTokenBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch token balance. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const fetchTotalAllocatedRewards = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const totalAllocated = await contract.getTotalAllocatedRewards();
      setTotalAllocatedRewards(totalAllocated);
      return totalAllocated;
    } catch (error) {
      console.error('Error fetching total allocated rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch total allocated rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return ethers.BigNumber.from(0);
    }
  };

  const calculateAmountPerNFT = async () => {
    const balance = await fetchTokenBalance();
    const totalAllocated = await fetchTotalAllocatedRewards();
    const unallocated = balance.sub(totalAllocated);
    const totalSupply = await fetchTotalSupply();
    if (totalSupply.gt(0)) {
      const balancePerNFT = unallocated.div(totalSupply).div(ethers.BigNumber.from(10).pow(TOKEN_DECIMALS)).toString();
      setAmountPerNFT(balancePerNFT);
      setRewardAmount(balancePerNFT); // Set rewardAmount to max by default
    }
  };

  const fetchNFTHolders = async () => {
    try {
      console.log('Fetching NFT holders...');
      const nftContract = await getNFTContract();
      const totalSupply = await nftContract.totalSupply().then((supply: ethers.BigNumber) => supply.toNumber());
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

      // Update total allocated rewards
      await fetchTotalAllocatedRewards();
      await calculateAmountPerNFT(); // Refresh data on the page
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
    if (!rewardAmount || parseFloat(rewardAmount) <= 0) {
      setIsValidAmount(false);
      setErrorMessage('Amount must be higher than zero');
      return;
    }

    if (parseFloat(rewardAmount) > parseFloat(amountPerNFT)) {
      setIsValidAmount(false);
      setErrorMessage('Value Too High!');
      return;
    } else {
      setIsValidAmount(true);
      setErrorMessage('');
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

  const handleApproveAndSendTokens = async () => {
    if (!erc20Amount || parseFloat(erc20Amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount of tokens to send.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const erc20Contract = await getERC20Contract();
      const amountInWei = ethers.utils.parseUnits(erc20Amount, TOKEN_DECIMALS);

      // Approve the contract to spend the tokens
      const approveTx = await erc20Contract.approve(CONTRACT_ADDRESS, amountInWei);
      await approveTx.wait();
      console.log('Token approval successful:', approveTx);

      // Transfer the tokens to the contract
      const transferTx = await erc20Contract.transfer(CONTRACT_ADDRESS, amountInWei);
      await transferTx.wait();
      console.log('Token transfer successful:', transferTx);

      toast({
        title: 'Success',
        description: 'Tokens sent to the contract successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh token balance
      await fetchTokenBalance();
    } catch (error: any) {
      console.error('Error sending tokens:', error);
      const errorMessage = error.reason || error.data || error.message;
      toast({
        title: 'Error',
        description: `Failed to send tokens: ${errorMessage}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchTotalSupply();
    calculateAmountPerNFT();
  }, [address]);

  useEffect(() => {
    setRewardAmount(amountPerNFT);
  }, [amountPerNFT]);

  useEffect(() => {
    if (address) {
      fetchContractOwner();
    }
  }, [address]);

  const handleMaxButtonClick = () => {
    setRewardAmount(amountPerNFT);
    setIsValidAmount(true);
    setErrorMessage('');
  };

  const handleRewardAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRewardAmount(value);
    if (parseFloat(value) <= 0) {
      setIsValidAmount(false);
      setErrorMessage('Amount must be higher than zero');
    } else if (parseFloat(value) > parseFloat(amountPerNFT)) {
      setIsValidAmount(false);
      setErrorMessage('Value Too High!');
    } else {
      setIsValidAmount(true);
      setErrorMessage('');
    }
  };

  const a2 = (parseFloat(ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)) - parseFloat(ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS))).toFixed(2);

  return (
    <Box>
      <ConnectButton />
      <Text fontSize="2xl" mb="4">Toast Champions Claim Processing</Text>
      <Box mb="4">
        {address && (
          <>
            <Text color={isOwner ? 'green.500' : 'red.500'}>
              {isOwner ? `Welcome Contract Owner: ${address}` : `Connected wallet is not the owner of the contract: ${address}`}
            </Text>
          </>
        )}
      </Box>
      <Box mb="4">
        <Text style={{ fontWeight: 'bold' }} fontSize="md">NFT Rewards Contract: {CONTRACT_ADDRESS}</Text>
      </Box>
      <Box mb="4">
        <Text fontSize="md">Step 1: Connect as contract owner to the dapp.</Text>
        <Text fontSize="md">Step 2: Send Toast tokens anytime from page or send to contract address.</Text>
        <Text fontSize="md">Step 3: Set the amount of Tokens to distribute to NFT Claims.</Text>
        <Text fontSize="md">Step 4: Tap the Process Claims Button and confirm transaction.</Text>
        <Text fontSize="md">Note: Tokens will then be allocated for user claims</Text>
      </Box>
      <Box mb="4">
        <InputGroup mb="2">
          <Input
            placeholder="Tokens you want to send to this contract"
            value={erc20Amount}
            onChange={(e) => setErc20Amount(e.target.value)}
          />
          <InputRightElement width="6rem">
          </InputRightElement>
        </InputGroup>
        <Button
          onClick={handleApproveAndSendTokens}
          bg="gray"
          textColor="white"
          _hover={{ bg: 'gray.400' }}
        >
          Send Tokens
        </Button>
      </Box>
      <Box mb="4">
        <Text fontSize="md">Unallocated Tokens in Contract: {a2} Toasty</Text>
        <Text fontSize="md">Total NFTs: {ethers.utils.formatUnits(totalSupply, 0)}</Text>
        <Text fontSize="md">Max tokens you can process per NFT: {amountPerNFT} Toasty</Text>
        <InputGroup mb="2">
          <Input
            placeholder="Reward Amount (Whole Tokens)"
            value={rewardAmount}
            onChange={handleRewardAmountChange}
            borderColor={isValidAmount ? 'inherit' : 'red'}
          />
          <InputRightElement width="6rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleMaxButtonClick}
              bg="gray"
              textColor="white"
              _hover={{ bg: 'gray.400' }}
            >
              Set Max
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button
          onClick={handleBatchRewards}
          textColor="white"
          bg={isValidAmount ? 'gray' : 'red'}
          _hover={{ bg: isValidAmount ? 'gray.400' : 'red.400' }}
          isDisabled={!isValidAmount}
        >
          {isValidAmount ? 'Process Claims' : errorMessage}
        </Button>
        <Text fontSize="sm">Note: You can disburse less than max if needed.</Text>
        <Box mb="4">
          <Text fontSize="md">Total Allocated Tokens awaiting user claims: {ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS)} Toasty</Text>
          <Text fontSize="md">Total Toast Balance in Contract: {ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)} Toasty</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default RewardsDistributor;
