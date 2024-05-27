import React from 'react';
import {
  Box,
  Link as ChakraLink,
  Flex,
  SimpleGrid,
  VStack,
  Image,
} from "@chakra-ui/react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#000', color: 'white', textAlign: 'center', padding: '20px 0' }}>
      <Flex direction="column" alignItems="center">
        <SimpleGrid columns={{ base: 1, md: 6 }} spacing="20px" width="100%" minH="100px" px="5" py="20px">
          {/* Column 1 */}
          <Box width="200px" padding="5px" />

          <Box padding="2px">
            <VStack align="center" color="white">
              <ChakraLink href="https://dexscreener.com/bsc/0x48087ac66e205063fb3462f873e19e802e184992" isExternal>
                <Image src="/images/footer/dexscrn.png" alt="Dexscreener Logo" width="180px" />
              </ChakraLink>
            </VStack>
          </Box>

          {/* Column 2 */}
          <Box padding="2px">
            <VStack align="center" color="white">
              <ChakraLink href="https://t.me/+EcHpneQgjthkMDRk" isExternal>
                <Image src="/images/footer/telegram.png" alt="Telegram Logo" width="180px" />
              </ChakraLink>
            </VStack>
          </Box>

          <Box padding="2px">
            <VStack align="center" color="white">
              <ChakraLink href="https://x.com/ToastEcosystem" isExternal>
                <Image src="/images/footer/x.png" alt="Twitter Logo" width="180px" />
              </ChakraLink>
            </VStack>
          </Box>

          <Box padding="2px">
            <VStack align="center" color="white">
              <ChakraLink href="https://bscscan.com/address/0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14#code" isExternal>
                <Image src="/images/footer/bscscan.png" alt="Bscscan Logo" width="180px" />
              </ChakraLink>
            </VStack>
          </Box>

          <Box width="300px" padding="5px" />
        </SimpleGrid>

        <ChakraLink href="toastecosystem.online" isExternal>
          <Image src="/images/footer/logotoast.png" alt="Toast Logo" width="180px" />
        </ChakraLink>
        <span>&copy; {currentYear} Toast Champions NFT Collection.</span>

        <Box
          bg="rgba(0,0,0,0)"
          padding="20px"
          width="100%"
          mx="auto"
          marginTop="120px"
        />
      </Flex>
    </footer>
  );
};

export default Footer;
