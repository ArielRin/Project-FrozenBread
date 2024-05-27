import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Link, Text, Box, Input, Image, InputGroup, InputRightElement, useToast } from '@chakra-ui/react';
import contractABI from './splitterABI.json';
import nftABI from './nftABI.json';
import erc20ABI from './erc20ABI.json';

import Footer from '../Footer/Footer';


const CONTRACT_ADDRESS = '0x9476C61BdeBEc61e95D5383ac6a793f9A69085A7'; // bsc
// const CONTRACT_ADDRESS = '0xa2092e8BFD818624C5b8EAd12464538C5067e401'; //bsctestnet
const NFT_ADDRESS = '0x466cc282a58333F3CD94690a520b5aFAD30506cD';
const ERC20_ADDRESS = '0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14';
const TOKEN_DECIMALS = 18;
const BATCH_SIZE = 50;

const RewardsDistributor = () => {
  const [rewardAmount, setRewardAmount] = useState<string>('');
  const [erc20Amount, setErc20Amount] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [tokenBalance, setTokenBalance] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [amountPerNFT, setAmountPerNFT] = useState<string>('');
  const [totalAllocatedRewards, setTotalAllocatedRewards] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
  const [claimedRewards, setClaimedRewards] = useState<ethers.BigNumber>(ethers.BigNumber.from(0));
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

  const fetchClaimedRewards = async (addresses: string[]) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

      let totalClaimed = ethers.BigNumber.from(0);
      for (const addr of addresses) {
        const claimed = await contract.getClaimedRewards(addr);
        totalClaimed = totalClaimed.add(claimed);
      }

      setClaimedRewards(totalClaimed);
      return totalClaimed;
    } catch (error) {
      console.error('Error fetching claimed rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch claimed rewards. Please try again.',
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
    const totalSupply = await fetchTotalSupply();

    const holderCounts = await fetchNFTHolders();
    const uniqueHolders = Object.keys(holderCounts);
    const totalClaimed = await fetchClaimedRewards(uniqueHolders);

    const unallocated = balance.add(totalClaimed).sub(totalAllocated);
    const a2 = parseFloat(ethers.utils.formatUnits(unallocated, TOKEN_DECIMALS));
    const amountPerNFTValue = totalSupply.gt(0) ? (a2 / totalSupply.toNumber()).toFixed(0) : '0';

    setAmountPerNFT(amountPerNFTValue);
    setRewardAmount(amountPerNFTValue); // Set rewardAmount to max by default
  };

  const fetchNFTHolders = async () => {
    try {
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

  const a2 = (
    parseFloat(ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)) +
    parseFloat(ethers.utils.formatUnits(claimedRewards, TOKEN_DECIMALS )) -
    parseFloat(ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS))
  ).toFixed(2);

  return (
    <>
      <header>
        <div className="header-logo">
          <Link href="/" isExternal>
            <Image src="/images/logotoast.png" alt="Toast Logo" width="150px" />
          </Link>
        </div>
        <div className="connect-button">
          <ConnectButton />
        </div>
      </header>
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 1)"
        bgImage="url('/images/toastBkg.png')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Box
          flex={1}
          p={0}
          m={0}
          display="flex"
          flexDirection="column"
          bg="rgba(0, 0, 0, 0.9)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >

          <Box
            bg="rgba(0,0,0,0)"
            padding="5px"
            width="100%"
            mx="auto"
            marginTop="0px"
          >
          </Box>

          <Box
            marginBottom="40px"
            bg="rgba(0,0,0,0.7)"
            borderRadius="2xl"
            padding="20px"
            mx="auto"
            my="10px"
            boxShadow="xl"
            maxWidth="600px"
            width="100%"
            textAlign="left"
            border="2px"
            borderColor="#a7801a"
          >



    <Box>
      <Text style={{ fontWeight: 'bolder' }}color="white" fontSize="3xl" mb="4">Toast Champions Claim Processing</Text>
      <Box mb="4">
        {address && (
          <>
            <Text fontSize="sm" style={{ fontWeight: 'bold' }} color={isOwner ? 'green.500' : 'red.500'}>
              {isOwner ? `Welcome Contract Owner: ${address}` : `Connected wallet is not the owner of the contract: ${address}`}
            </Text>
          </>
        )}
      </Box>
      <Box mb="4">
        <Text   style={{ color: 'white' ,fontWeight: 'bold' }} fontSize="sm">NFT Rewards Contract: {CONTRACT_ADDRESS}</Text>
      </Box>
      <Box mb="4">
        <Text color="white"  fontSize="sm">Step 1: Connect as contract owner to the dapp.</Text>
        <Text color="white"  fontSize="sm">Step 2: Send Toast tokens anytime from this page or send to contract address directly.</Text>
        <Text color="white"  fontSize="sm">Step 3: Set the amount of Tokens to distribute to NFT Claims.</Text>
        <Text color="white"  fontSize="sm">Step 4: Tap the Process Claims Button and confirm transaction.</Text>
        <Text color="white"  fontSize="sm">Note: Tokens will then be allocated for user claims</Text>
      </Box>
      <Box mb="4">
        <InputGroup mb="2">
          <Input
            placeholder="Tokens you want to send to this contract"
            value={erc20Amount}
            onChange={(e) => setErc20Amount(e.target.value)}
            textColor="white"
            borderColor="#a7801a"
          />
          <InputRightElement width="6rem">
          </InputRightElement>
        </InputGroup>
        <Button
          onClick={handleApproveAndSendTokens}
          bg="#a7801a"
          textColor="white"
          _hover={{ bg: '#e8bf72' }}
        >
          Send Tokens
        </Button>
      </Box>
      <Box mb="4">
        <Text color="white"  fontSize="md">Unallocated Tokens in Contract: {a2} Toasty</Text>
        <Text color="white"  fontSize="md">Total NFTs: {totalSupply.toString()}</Text>
        <Text color="white"  fontSize="md">Max tokens you can process per NFT: {amountPerNFT} Toasty</Text>
        <InputGroup mb="2">
          <Input
            placeholder="Reward Amount (Whole Tokens)"
            value={rewardAmount}
            onChange={handleRewardAmountChange}
            textColor="white"
            borderColor={isValidAmount ? '#a7801a' : 'red'}
          />
          <InputRightElement width="6rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleMaxButtonClick}
              bg="#a7801a"
              textColor="white"
              _hover={{ bg: '#e8bf72' }}
            >
              Set Max
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button
          onClick={handleBatchRewards}
          textColor="white"
          bg={isValidAmount ? '#a7801a' : 'red'}
          _hover={{ bg: isValidAmount ? '#e8bf72' : 'red' }}
          isDisabled={!isValidAmount}
        >
          {isValidAmount ? 'Process Claims' : errorMessage}
        </Button>
        <Text color="white"  fontSize="sm">Note: You can disburse less than max if needed.</Text>
        <Box mb="4">
          <Text color="white"  fontSize="md">Total Allocated to claim to date: {ethers.utils.formatUnits(totalAllocatedRewards, TOKEN_DECIMALS)} Toasty</Text>
          <Text color="white"  fontSize="md">Total Toast Balance in Contract: {ethers.utils.formatUnits(tokenBalance, TOKEN_DECIMALS)} Toasty</Text>
        </Box>
      </Box>
    </Box>



      </Box>
    <Footer />
  </Box>
</Box>
</>
  );
};

export default RewardsDistributor;
