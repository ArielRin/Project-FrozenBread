import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ToastContainer, toast as notify } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Box,
  Button,
  Image,
  Text,
  Link,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';

import Footer from '../Footer/Footer';
import nftMintAbi from './nftMintAbi.json';
import ClaimToast from '../Claim/ClaimToast';

const NFTMINT_CONTRACT_ADDRESS = '0x466cc282a58333F3CD94690a520b5aFAD30506cD';
const RPC_PROVIDER = 'https://bsc-dataseed.binance.org/';
const EXPLORER_LINK = 'https://bscscan.com/'; 

const getExplorerLink = (tokenId: number) => `${EXPLORER_LINK}token/${NFTMINT_CONTRACT_ADDRESS}?a=${tokenId}`;
const getMarketplaceLink = (tokenId: number) => `https://element.market/assets/bsc/${NFTMINT_CONTRACT_ADDRESS}/${tokenId}`;

const addNftToWallet = async (tokenId: number) => {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('Ethereum object not found');
    }

    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: NFTMINT_CONTRACT_ADDRESS,
          tokenId: tokenId.toString(),
          symbol: 'TOASTIES',
          image: `https://raw.githubusercontent.com/ArielRin/Project-FrozenBread/master/build-1/images/${tokenId}.png`,
        },
      },
    });

    if (wasAdded) {
      console.log('Asset added');
    } else {
      console.log('Asset addition rejected');
    }
  } catch (error) {
    console.error('Error adding NFT to wallet', error);
  }
};

function MyNfts() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [nfts, setNfts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNFTs = async () => {
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

    try {
      setLoading(true);
      const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);
      const contract = new ethers.Contract(NFTMINT_CONTRACT_ADDRESS, nftMintAbi, provider);
      const balance = await contract.balanceOf(address);
      const nftList: number[] = [];
      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(address, i);
        nftList.push(tokenId.toNumber());
      }
      setNfts(nftList);
    } catch (error) {
      toast({
        title: 'Error Fetching NFTs',
        description: 'There was an issue fetching NFTs from the contract.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error fetching NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchNFTs();
    }
  }, [isConnected]);

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
        bgImage="url('/images/animatedtoast.gif')"
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
          bg="rgba(0, 0, 0, 0.2)"
          bgPosition="center"
          bgRepeat="no-repeat"
          bgSize="cover"
        >
          <Box
            marginBottom="40px"
            bg="rgba(0,0,0,0.6)"
            borderRadius="2xl"
            padding="20px"
            maxW="90%"
            mx="auto"
            my="20px"
          >
            {/* Include ClaimToast component */}
            <ClaimToast />
            {/* Include ClaimToast component */}

            <Box marginTop="4" marginBottom="10" display="flex" alignItems="center" justifyContent="center">
              <Link
                style={{
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
                href="/"
                mt="2"
                color="white"
                textAlign="center"
              >
                Back to Minting Page
              </Link>
            </Box>

            <Text
              className="pricecosthead"
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bolder',
              }}
            >
              My Toasties
            </Text>
            {loading ? (
              <Text
                className="totalSupply"
                style={{
                  marginBottom: '40px',
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                Please be patient while Loading...
              </Text>
            ) : nfts.length === 0 ? (
              <Text
                className="totalSupply"
                style={{
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                No Toasties found.
              </Text>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing="10px">
                {nfts.map((tokenId) => (
                  <Box
                    key={tokenId}
                    bg="rgba(0, 0, 0, 1)"
                    p="4"
                    borderRadius="xl"
                    position="relative"
                    overflow="hidden"
                    _hover={{
                      '.overlay': {
                        opacity: 1,
                      }
                    }}
                  >
                    <Image
                      src={`/images/nfts/${tokenId}.png`}
                      alt={`NFT ${tokenId}`}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                    <Box
                      className="overlay"
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      bg="rgba(0, 0, 0, 0.7)"
                      opacity="0"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      transition="opacity 0.3s ease-in-out"
                    >
                      <Text mt="2" color="white" textAlign="center">
                        Toasties TokenId {tokenId}
                      </Text>
                      <Link href={getMarketplaceLink(tokenId)} isExternal>
                        <Button
                          mt="2"
                          width="100%"
                          bg="#e8bf72"
                          textColor="white"
                          _hover={{ bg: '#a7801a' }}
                        >
                          View on Marketplace
                        </Button>
                      </Link>
                      <Button
                        mt="2"
                        width="60%"
                        bg="#e8bf72"
                        textColor="white"
                        _hover={{ bg: '#a7801a' }}
                        onClick={() => addNftToWallet(tokenId)}
                      >
                        Add to Wallet
                      </Button>
                      <Link
                        style={{
                          marginTop: '40px',
                          color: 'white',
                          padding: '10px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}
                        href={getExplorerLink(tokenId)}
                        isExternal
                        mt="2"
                        color="white"
                        textAlign="center"
                      >
                        View on BSCScan
                      </Link>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>
          <Box
            bg="rgba(0,0,0,0)"
            padding="20px"
            width="100%"
            mx="auto"
            marginTop="30px"
          >
            <Image
              marginBottom="40px"
              src="/images/toastmanImage.png"
              mx="auto"
              alt="Toast Man"
              width="220px"
            />
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
}

export default MyNfts;
