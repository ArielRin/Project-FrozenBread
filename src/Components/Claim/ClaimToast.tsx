import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { Box, Flex, Button, Text, useToast, Image } from '@chakra-ui/react';

import contractABI from './splitterABI.json'; // Use your ABI here

const CONTRACT_ADDRESS = '0x88a91014AFc11533c85551379DD06F795F833CF6'; // Replace with your contract address
const TOKEN_DECIMALS = 9;

const ClaimRewards = () => {
  const [rewardBalance, setRewardBalance] = useState('');
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
      setRewardBalance(ethers.utils.formatUnits(reward, TOKEN_DECIMALS));
    } catch (error) {
      console.error('Error fetching reward balance:', error);
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
      fetchRewardBalance(); // Refresh the reward balance after claiming
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
  }, [address]);

  return (
    <>
      {rewardBalance && parseFloat(rewardBalance) > 0 && (
        <Box
          bg="rgba(0, 0, 0, 0.6)"
          p={6}
          borderRadius="2xl"
          boxShadow="xl"
          width="100%"
          textAlign="center"
          border="0px"
          borderColor="purple"
        >
          <Flex color="white" alignItems="center" mb="1">
            <Image src="/images/sup.png" alt="" boxSize="150px" borderRadius="xl" mr="2" />
            <Box textAlign="left">
              <Text fontSize="lg" fontWeight="semibold" textAlign="left">
                You've got TOASTY Rewards!
              </Text>
              <Text fontSize="2xl" fontWeight="semibold" textAlign="left">
                {rewardBalance} TOASTY Tokens
              </Text>
            </Box>
          </Flex>
          <Flex mb="4" alignItems="center" justifyContent="space-between">
            <Text fontSize="lg" fontWeight="semibold" textAlign="left"></Text>
            <Button
              mt="2"
              width="60%"
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
