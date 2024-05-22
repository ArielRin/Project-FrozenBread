
// @CMH ICE PUT VAVIABLES AT TOP FOR EASE USE
const MAX_SUPPLY = 150;
const MINT_PRICE = 0.04;
const NFTMINT_CONTRACT_ADDRESS = '0x6aD7cCE6eF4AC1EaB35c6e0068B5adCf8561870D';
const getExplorerLink = () => `https://scan.maxxchain.org/address/${NFTMINT_CONTRACT_ADDRESS}`;



// @CMH ICE THE IMPORTS ARE BELOW

import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useContractWrite } from 'wagmi';

import {
  Box,
  Button,
  Image,
  Text,
  Link,
  Link as ChakraLink,
  useToast,
  Flex,
  HStack,
  Spacer,
} from '@chakra-ui/react';


import './mintNftStyles.css';

import nftMintAbi from './nftMintAbi.json';
import mainbackgroundImage from "./bg2.png";
import toastmanImage from "./toastmanImage.png";
import toastLogo from "../Footer/logos/logotoast.png";
import MainTextLogo from './headerLogo.png';



import Footer from '../Footer/Footer';



// @CMH Ice below is the functions to mint

function NftMint() {



  const maxSupply = MAX_SUPPLY;
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mintAmount, setMintQuantity] = useState(1);
  const [mintLoading, setMintLoading] = useState(false);

  const contractConfig = {
    addressOrName: NFTMINT_CONTRACT_ADDRESS,
    contractInterface: nftMintAbi,
  };

  const { writeAsync: mint, error: mintError } = useContractWrite({
    ...contractConfig,
    functionName: 'mint',
    args: [mintAmount],
    overrides: {
      value: ethers.utils.parseEther((MINT_PRICE * mintAmount).toString()),
    },
  });

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchContractData = async () => {
    if (!window.ethereum) {
      toast({
        title: 'Error',
        description: 'Ethereum object not found, make sure you have MetaMask!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider('https://mainrpc.maxxchain.org/');
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const supply = await contract.totalSupply();
      setTotalSupply(supply.toNumber());
    } catch (error) {
      toast({
        title: 'Error Fetching Data',
        description: 'There was an issue fetching data from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      console.error('Error fetching contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  interface ContractError extends Error {
    data?: {
      message: string;
    };
  }

  const onMintClick = async () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setMintLoading(true);
    try {
      const tx = await mint();
      await tx.wait();
      toast({
        title: 'Mint Successful',
        description: `You have successfully minted ${mintAmount} NFT(s).`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
      fetchContractData();
    } catch (error: unknown) {
      console.error('Minting error:', error);
      const contractError = error as ContractError;
      const errorMessage = contractError.data ? contractError.data.message : 'An unknown error occurred.';
      toast({
        title: 'Minting Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setMintLoading(false);
    }
  };

  const handleIncrement = () => {
    setMintQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setMintQuantity((prev) => Math.max(prev - 1, 1));
  };

  const remainingSupply = maxSupply - totalSupply;







// @CMH ICE THIS IS THE PAGE LAYOUT



  return (
    <>
      <header>
        <Flex justifyContent="space-between" alignItems="center" p={2}  >

            <ChakraLink href="/">
              <Image src={toastLogo} alt="Toast Logo" width="150px" />
            </ChakraLink>

        </Flex>
        <ConnectButton />

      </header>
      <Box
        flex={1}
        p={0}
        m={0}
        display="flex"
        flexDirection="column"
        bg="rgba(0, 0, 0, 0)"
        bgImage={`url(${mainbackgroundImage})`}
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
          bg="rgba(0, 0, 0, 0.5)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >
          <Box
            bg="rgba(0,0,0,0)"
            padding="20px"
            width="100%"
            mx="auto"
            marginTop="60px"
          />
          <Box
            bg="rgba(0,0,0,0.6)"
            borderRadius="md"
            padding="20px"
            maxW="600px"
            mx="auto"
            my="20px"
          >
            <div>
              <Text className="pricecosthead" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
                Toast Champions NFT Collection
              </Text>
              <Text className="totalSupply" style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {loading ? 'Loading...' : `Sold : ${totalSupply} / ${maxSupply}`}
              </Text>
              <Text className="remainingSupply" style={{ color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                {loading ? 'Loading...' : `Remaining Supply: ${remainingSupply}`}
              </Text>
              <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{ color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
                {NFTMINT_CONTRACT_ADDRESS}
              </Link>
              <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{ color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
                View on Explorer
              </Link>
            </div>
            {remainingSupply > 0 ? (
              <>
                <Text className="pricecost" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
                  Mint at {MINT_PRICE} BNB Each
                </Text>
                <Box marginTop='4' display='flex' alignItems='center' justifyContent='center'>
                  <Button
                    onClick={handleDecrement}
                    disabled={mintAmount <= 1 || mintLoading || remainingSupply === 0}
                    textColor='white'
                    bg='#e8bf72'
                    _hover={{ bg: '#a7801a' }}>
                    -
                  </Button>
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }} mx='4'>{mintAmount}</Text>
                  <Button
                    onClick={handleIncrement}
                    disabled={mintAmount >= remainingSupply || mintLoading}
                    textColor='white'
                    bg='#e8bf72'
                    _hover={{ bg: '#a7801a' }}>
                    +
                  </Button>
                </Box>
                <Box marginTop='4' marginBottom='10' display='flex' alignItems='center' justifyContent='center'>
                  <Button
                    onClick={onMintClick}
                    disabled={!isConnected || mintLoading || remainingSupply === 0}
                    textColor='white'
                    bg='#e8bf72'
                    _hover={{ bg: '#a7801a' }}
                    marginTop='4'>
                    Mint Now
                  </Button>
                </Box>
              </>
            ) : (
              <Text className="pricecost" style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }}>
                Minting has Completed!
              </Text>
            )}
            {mintError && <Text color="red.500" mt="4">Error: {mintError.message}</Text>}
          </Box>
          <Box
            bg="rgba(0,0,0,0)"
            padding="20px"
            width="100%"
            mx="auto"
            marginTop="40px"
          >
            <Image src={toastmanImage} mx="auto" alt="Description of Image" width="220px" />
          </Box>
          // @CMH THIS FOOTER IS REFERENCED FROM COMPONENTS
          <Footer />
        </Box>
      </Box>
    </>
  );
}

export default NftMint;
