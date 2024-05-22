import React, { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Launch from './Pages/Launch/Launchpad';
import Staking from './Pages/Staking/Staking';
import List from './Pages/Launch/listTokensLaunchedDecending';
import DeployStake from './Pages/Launch/DeployStaking1Month';
DeployStake
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
        <Route path="/launch" element={<Launch />} />
        <Route path="/deploystake" element={<DeployStake />} />
        <Route path="/staking" element={<Staking />} />
        <Route path="/list" element={<List />} />
      </Routes>
    </Router>
  );
}

export default App;



// ***
