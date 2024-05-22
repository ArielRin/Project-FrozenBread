import React, { useEffect, useState } from 'react';

import Footer from '../Footer/Footer';




import {
  Box,
  Button,
  Image,
  Text,
  Link,
  Container,
  Link as ChakraLink,

  useToast,
} from '@chakra-ui/react';

import { ethers } from 'ethers';

import Web3 from 'web3';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';

import nftMintAbi from './nftMintAbi.json';
import mainbackgroundImage from "./animatedtoast.gif";


const NFTMINT_CONTRACT_ADDRESS = '0x6aD7cCE6eF4AC1EaB35c6e0068B5adCf8561870D';

const getExplorerLink = () => `https://scan.maxxchain.org/address/${NFTMINT_CONTRACT_ADDRESS}`;

// const getExplorerLink = () => `https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`;

import './mintNftStyles.css';
import toastLogo from "../Footer/logos/logotoast.png";

import { ConnectButton } from '@rainbow-me/rainbowkit';



function NftMint() {
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
      value: ethers.utils.parseEther((0.04 * mintAmount).toString()),
    },
  });

  useEffect(() => {
    fetchContractData();
    const interval = setInterval(fetchContractData, 30000); // Refresh every 30 seconds
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
      });
      return;
    }

    setMintLoading(true);
  try {
    const tx = await mint();
    await tx.wait();
    // ... [handle the successful mint case] ...
    fetchContractData(); // Refresh data after mint
  } catch (error: unknown) {
    console.error('Minting error:', error);
    // Use type assertion to treat the error as a ContractError
    const contractError = error as ContractError;
    const errorMessage = contractError.data ? contractError.data.message : 'An unknown error occurred.';
    toast({
      title: 'Minting Error',
      description: errorMessage,
      status: 'error',
      duration: 5000,
      isClosable: true,
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

  const maxSupply = 150;
  const remainingSupply = maxSupply - totalSupply;

  return (
    <Box
      flex={1}
      p={0}
      m={0}
      display="flex"
      flexDirection="column"
      bg="rgba(0, 0, 0, 1)"
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
                            bg="rgba(0,0,0,0)" // Choose your desired background color
                            padding="20px" // Apply padding inside the box
                            width="100%" // Set the width of the box
                            mx="auto" // Center the box
                            marginTop="5px"
                          >
                          </Box>
<ConnectButton />

                    <Box
                      bg="rgba(0,0,0,0)" // Choose your desired background color
                      padding="20px" // Apply padding inside the box
                      width="100%" // Set the width of the box
                      mx="auto" // Center the box
                      marginTop="60px"
                    >
                    </Box>
      <Box
        bg="rgba(0,0,0,0.6)" // Choose your desired background color
        borderRadius="md" // Optional: for rounded corners
        padding="20px" // Apply padding inside the box
        width="90%" // Set the width of the box
        mx="auto" // Center the box
        my="20px" // Optional: additional vertical margin outside the box
      >
          <div>

          <ChakraLink href="toastecosystem.online" isExternal>
            <Image src={toastLogo} alt="Description of Image" width="220px"  />
          </ChakraLink>
            <Text className="pricecosthead" style={{color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
              Toast Champions NFT Collection
            </Text>
            <Text className="totalSupply" style={{color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {loading ? 'Loading...' : `Sold : ${totalSupply} / ${maxSupply}`}
            </Text>
            <Text className="remainingSupply" style={{color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
              {loading ? 'Loading...' : `Remaining Supply: ${remainingSupply}`}
            </Text>
            <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
              {NFTMINT_CONTRACT_ADDRESS}
            </Link>
            <Link isExternal href={`https://bscscan.com/token/${NFTMINT_CONTRACT_ADDRESS}`} className="contractaddr" style={{color: 'white', display: 'block', textAlign: 'center', fontWeight: 'bold', marginTop: '10px' }}>
              View on Explorer
            </Link>
          </div>
          {remainingSupply > 0 ? (
            <>
              <Text className="pricecost" style={{color: 'white', textAlign: 'center', fontWeight: 'bolder' }}>
                Mint at 0.04 BNB Each
              </Text>
              <Box marginTop='4' display='flex' alignItems='center' justifyContent='center'>
                <Button
                  onClick={() => setMintQuantity(mintAmount - 1)}
                  disabled={mintAmount <= 1 || mintLoading || remainingSupply === 0}
                  textColor='white'
                  bg='#e0b721'
                  _hover={{ bg: '#a7801a' }}>
                  -
                </Button>
                <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bolder', marginTop: '20px' }} mx='4'>{mintAmount}</Text>
                <Button
                  onClick={() => setMintQuantity(mintAmount + 1)}
                  disabled={mintAmount >= remainingSupply || mintLoading}
                  textColor='white'
                  bg='#e0b721'
                  _hover={{ bg: '#a7801a' }}>
                  +
                </Button>
              </Box>
              <Box marginTop='4'marginBottom='10' display='flex' alignItems='center' justifyContent='center' >
              <Button
                onClick={onMintClick}
                disabled={!isConnected || mintLoading || remainingSupply === 0}
                textColor='white'
                bg='#e0b721'
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
                                      bg="rgba(0,0,0,0)" // Choose your desired background color
                                      padding="20px" // Apply padding inside the box
                                      width="100%" // Set the width of the box
                                      mx="auto" // Center the box
                                      marginTop="60px"
                                    >
                                    </Box>



            <Footer/>
             </Box>
    </Box>
 );
};

export default NftMint;
