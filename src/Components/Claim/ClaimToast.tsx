import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Box, Flex, Button, Text, useToast, Image } from '@chakra-ui/react';

import contractABI from './splitterABI.json';

const CONTRACT_ADDRESS = '0xa2092e8BFD818624C5b8EAd12464538C5067e401';
const TOKEN_DECIMALS = 9;
const TOKEN_ADDRESS = '0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14';

const ClaimRewards = () => {
  const [rewardBalance, setRewardBalance] = useState('');
  const [tokenPriceUSD, setTokenPriceUSD] = useState<number | null>(null);
  const { address } = useAccount();
  const toast = useToast();

  const getContractWithSigner = async () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('No crypto wallet found. Please install it.');
    }

    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
  };

  const fetchRewardBalance = async () => {
    if (!address) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
      const reward = await contract.rewards(address);
      const formattedReward = ethers.utils.formatUnits(reward, TOKEN_DECIMALS);
      console.log('Fetched reward balance:', formattedReward); // Log the reward balance
      setRewardBalance(formattedReward);
    } catch (error) {
      console.error('Error fetching reward balance:', error);
    }
  };

  const fetchTokenPrice = async () => {
    try {
      const response = await fetch(`https://api.geckoterminal.com/api/v2/simple/networks/bsc/token_price/${TOKEN_ADDRESS}`);
      const data = await response.json();
      console.log('API response:', data); // Log the full API response
      const price = data.data.attributes.token_prices[TOKEN_ADDRESS.toLowerCase()];
      console.log('Fetched token price:', price); // Log the token price
      setTokenPriceUSD(parseFloat(price));
    } catch (error) {
      console.error('Error fetching token price:', error);
      setTokenPriceUSD(null);
    }
  };

  const claimRewards = async () => {
    try {
      const contract = await getContractWithSigner();
      const tx = await contract.claimRewards();
      await tx.wait();
      toast({
        title: 'Success',
        description: 'Rewards claimed successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchRewardBalance();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to claim rewards. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchRewardBalance();
    fetchTokenPrice();
  }, [address]);

  const usdValue = tokenPriceUSD !== null && !isNaN(parseFloat(rewardBalance))
    ? (parseFloat(rewardBalance) * tokenPriceUSD).toFixed(2)
    : '0.00000000';

  return (
    <>
      {rewardBalance && parseFloat(rewardBalance) > 0 && (
        <Box
          bg="rgba(0, 0, 0, 0.6)"
          p={15}
          borderRadius="2xl"
          boxShadow="xl"
          maxWidth="800px"
          width="100%"
          textAlign="center"
          border="1px"
          borderColor="#a7801a"
        >

          <Flex color="white" alignItems="center" mb="1">
            <Image src="/images/sup.png" alt="" boxSize="120px" borderRadius="xl" mr="2" />
            <Box textAlign="left">
              <Text fontSize="lg" fontWeight="semibold" textAlign="left">
                You've got TOASTY Tokens to Collect!
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
                {rewardBalance} TOASTY
              </Text>
              <Text fontSize="sm" fontWeight="normal" textAlign="left">
                ${usdValue} USD Value
              </Text>
            </Box>
          </Flex>
          <Flex mb="4" alignItems="center" justifyContent="space-between">
            <Text fontSize="lg" fontWeight="semibold" textAlign="left"></Text>
            <Button
              mt="2"
              width="38%"
              bg="#e8bf72"
              textColor="white"
              _hover={{ bg: '#a7801a' }}
              onClick={claimRewards}
            >
              Claim your Toast
            </Button>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default ClaimRewards;
