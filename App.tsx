import React, { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Drop from './Components/RewardsDistributor/RewardsDistributor';
import Claim from './Components/RewardsDistributor/claimNftRewards';

import Nfts from './Components/NFTViewer/NFTViewer';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  Box,
  Container,
  Link,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
  Button,
  Input,
} from '@chakra-ui/react';




import Web3 from 'web3';
import { ethers } from 'ethers';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nfts" element={<Nfts />} />
        <Route path="/drop" element={<Drop />} />
        <Route path="/claim" element={<Claim />} />
      </Routes>
    </Router>
  );
}

export default App;



// ***
