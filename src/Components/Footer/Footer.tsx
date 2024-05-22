import React from 'react';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Box,
  Link as ChakraLink,
  Flex,
  Container,
  SimpleGrid,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Spacer,
  Tab,
  TabPanel,
  Input,
  Button,
  Text,
  Image,
  useToast,
  Collapse,
} from "@chakra-ui/react";



import toastLogo from "./logos/logotoast.png";


import bscscanLogo from "./logos/bscscan.png";
import cmcLogo from "./logos/cmc.png";
import dexscrnLogo from "./logos/dexscrn.png";
import geckoLogo from "./logos/gecko.png";
import elementLogo from "./logos/element.png";
import githubLogo from "./logos/github.png";
import mediumLogo from "./logos/medium.png";
import openseaLogo from "./logos/opensea.png";
import pcsLogo from "./logos/pcs.png";
import pooLogo from "./logos/poo.png";
import telegramLogo from "./logos/telegram.png";
import tofuLogo from "./logos/tofu.png";
import xLogo from "./logos/x.png";




const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

        return (
          <footer style={{ backgroundColor: '#000', color: 'white', textAlign: 'center', padding: '20px 0' }}>
              <Flex direction="column" alignItems="center">

                  <SimpleGrid columns={{ base: 1, md: 6 }} spacing="20px" width="100%" minH="100px" px="5" py="20px">
                      {/* Column 1 */}
                      <Box width="200px" padding="5px">

                      </Box>
                      <Box  padding="5px">
                        <VStack align="center" color="white">
                        <ChakraLink href="https://dexscreener.com/bsc/0x48087ac66e205063fb3462f873e19e802e184992" isExternal>
                          <Image src={dexscrnLogo} alt="Description of Image" width="220px"  />
                        </ChakraLink>
                        </VStack>
                      </Box>

                      {/* Column 2 */}
                      <Box padding="5px">
                        <VStack align="center" color="white">
                        <ChakraLink href="https://t.me/+EcHpneQgjthkMDRk" isExternal>
                          <Image src={telegramLogo} alt="Description of Image" width="220px"  />
                        </ChakraLink>
                        </VStack>
                      </Box>

                      <Box padding="5px">
                        <VStack align="center" color="white">
                        <ChakraLink href="https://x.com/ToastEcosystem" isExternal>
                          <Image src={xLogo} alt="Description of Image" width="220px"  />
                        </ChakraLink>
                        </VStack>
                      </Box>

                      <Box padding="5px">
                        <VStack align="center" color="white">
                        <ChakraLink href="https://bscscan.com/address/0x0e88A6839cf02f23fFE16E23cBB723FE066f8b14#code" isExternal>
                          <Image src={bscscanLogo} alt="Description of Image" width="220px"  />
                        </ChakraLink>

                        </VStack>
                      </Box>
                      <Box width="300px" padding="5px">

                      </Box>
                      {/* Repeat the Box with different content as needed for each column */}
                  </SimpleGrid>
                  <ChakraLink href="toastecosystem.online" isExternal>
                    <Image src={toastLogo} alt="Description of Image" width="220px"  />
                  </ChakraLink>
                  <span>&copy; {currentYear} Toast Champions NFT Collection.</span>


                                      <Box
                                        bg="rgba(0,0,0,0)" // Choose your desired background color
                                        padding="20px" // Apply padding inside the box
                                        width="100%" // Set the width of the box
                                        mx="auto" // Center the box
                                        marginTop="120px"
                                      >
                                      </Box>

              </Flex>
          </footer>
        );
    };

    export default Footer;

// <span>
//     Follow us on
//     <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Twitter</a>,
//     <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Facebook</a>,
//     <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'white', margin: '0 10px' }}>Instagram</a>
// </span>
