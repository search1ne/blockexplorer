import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState();
  const [selectedBlockTransactions, setSelectedBlockTransactions] = useState([]);

  useEffect(() => {
    async function getBlocks() {
      const blocks = await alchemy.core.getBlock();
      setBlocks(blocks);
    }

    getBlocks();
  }, []);

  useEffect(() => {
    async function getBlockWithTransactions(blockNumber) {
      const block = await alchemy.core.getBlockWithTransactions(blockNumber);
      const transactions = block.transactions;

      const transactionReceipts = await Promise.all(
        transactions.map(async tx => {
          const receipt = await alchemy.core.getTransactionReceipt(tx.hash);
          return { ...tx, receipt };
        })
      );
      setSelectedBlockTransactions(transactionReceipts);
    }

    // if block is selected, get the block with transactions
    if (selectedBlock) {
      getBlockWithTransactions(selectedBlock.number);
    }
  }, [selectedBlock]);

  const handleBlockSelect = (block) => {
    setSelectedBlock(block);
    setSelectedBlockTransactions(block.transactions);
  };

  return (
    <div className="Block Explorer">
      <div>
        <h1>Block Explorer</h1>
      </div>

      {blocks.length > 0 ? (
        <div>
          {blocks.map((block) => (
            <div key={block.number}>
              <button onClick={() => handleBlockSelect(block)}>
                Block: {block.number}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No blocks to display</p>
      )}

      {selectedBlock ? (
        <div>
          <h2>Block Details</h2>
          <p>Number: {selectedBlock.number}</p>
          <p>Hash: {selectedBlock.hash}</p>
          <h3>Transactions</h3>
          {selectedBlockTransactions.map((tx) => (
            <div key={tx.hash}>
              Transaction: {tx.hash}
              <br />
              Receipt: {JSON.stringify(tx.receipt)}
            </div>
          ))}
        </div>
      ) : (
        <p>No block selected</p>
      )}
    </div>
  );
}

export default App;
