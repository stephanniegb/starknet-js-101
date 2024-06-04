"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Contract, RpcProvider } from "starknet";
import { connect, disconnect } from "starknetkit";
import contractABI from "./abis/abi.json";
import { CONTRACT_ADDRESS, IMPLEMENTATION_HASH } from "./addresses/addresses";

export default function Home() {
  const [connection, setConnection] = useState<any>(undefined);
  const [account, setAccount] = useState();
  const [address, setAddress] = useState<string | undefined>("");
  const [provider, setProvider] = useState<RpcProvider | undefined>(undefined);
  const [numDeployed, setNumDeployed] = useState("");
  const [tbaAddress, setTbaAccount] = useState("");
  const [inputFields, setInputFields] = useState({
    tokenAddress: "",
    tokenId: "",
    salt: "",
    tokenAddressGDA: "",
    tokenIdGDA: "",
    tokenAddressGA: "",
    tokenIdGA: "",
  });
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputFields((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const conn = await connect({
          webWalletUrl: "https://web.argent.xyz",
          modalMode: "neverAsk",
        });
        if (conn) {
          const { wallet } = conn;
          if (wallet?.isConnected) {
            setConnection(conn);
            setAccount(wallet.account);
            setAddress(wallet.selectedAddress);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    connectWallet();

    const initializedProvider = new RpcProvider({
      nodeUrl:
        "https://starknet-sepolia.infura.io/v3/" + process.env.NEXT_INFURA_KEY,
    });
    setProvider(initializedProvider);
  }, []);

  const connectWallet = async () => {
    try {
      const conn = await connect({
        webWalletUrl: "https://web.argent.xyz",
      });
      if (conn) {
        const { wallet } = conn;
        if (wallet?.isConnected) {
          setConnection(conn);
          setAccount(wallet.account);
          setAddress(wallet.selectedAddress);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      setConnection(undefined);
      setAccount(undefined);
      setAddress("");
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalNumberOfDeployedAccounts = async ({
    address,
    id,
  }: {
    address: string;
    id: string;
  }) => {
    if (provider) {
      const contract = new Contract(contractABI, CONTRACT_ADDRESS, provider);

      try {
        const value = await contract.total_deployed_accounts(address, id);
        setNumDeployed(value.toString());
        setInputFields((prev) => {
          const curr = prev;
          curr.tokenAddressGDA = "";
          curr.tokenIdGDA = "";
          return curr;
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getAccount = async ({
    address,
    id,
  }: {
    address: string;
    id: string;
  }) => {
    const contract = new Contract(contractABI, CONTRACT_ADDRESS, provider);

    try {
      if (provider) {
        const acc = await contract.get_account(
          IMPLEMENTATION_HASH,
          address,
          id,
          4
        );
        const add = `0x0${acc.toString(16)}`;
        setTbaAccount(add);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createAccount = async ({
    address,
    id,
    salt = 15,
  }: {
    address: string;
    id: string;
    salt?: number;
  }) => {
    const contract = new Contract(contractABI, CONTRACT_ADDRESS, account);

    try {
      if (account) {
        await contract.create_account(IMPLEMENTATION_HASH, address, id, salt);
        setInputFields((prev) => {
          const curr = prev;
          curr.tokenAddress = "";
          curr.tokenId = "";
          curr.salt = "";
          return curr;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-center mb-8">Contract address:</h1>
        <p className="bg-slate-800 p-3 rounded-[20px] w-[90vw] lg:w-[40vw]">
          {address}
        </p>
      </div>
      <div className="flex w-full gap-4 mb-8">
        {connection ? (
          <button onClick={disconnectWallet}>disconnect</button>
        ) : (
          <button onClick={connectWallet}>Connect</button>
        )}
      </div>
      <div className="mb-8">
        <div className="flex flex-col gap-4 mb-8">
          <label htmlFor="tokenAddress">Token Address:</label>
          <input
            type="text"
            name="tokenAddress"
            id="tokenAddress"
            placeholder="0x0..."
            value={inputFields.tokenAddress}
            required
            onChange={handleInputChange}
          />
          <label htmlFor="tokenId">Token ID:</label>
          <input
            type="text"
            name="tokenId"
            id="tokenId"
            placeholder="000..."
            value={inputFields.tokenId}
            required
            onChange={handleInputChange}
          />
          <label htmlFor="salt">Salt:</label>
          <input
            type="text"
            name="salt"
            value={inputFields.salt}
            placeholder="Optional"
            onChange={handleInputChange}
          />
        </div>
        <button
          onClick={() =>
            createAccount({
              address: inputFields.tokenAddress,
              id: inputFields.tokenId,
            })
          }
        >
          create account
        </button>
      </div>
      <div className="w-full my-8 flex flex-col gap-4">
        <label htmlFor="tokenAddressGDA">Token Address:</label>
        <input
          type="text"
          name="tokenAddressGDA"
          id="tokenAddressGDA"
          placeholder="0x0..."
          value={inputFields.tokenAddressGDA}
          required
          onChange={handleInputChange}
        />
        <label htmlFor="tokenIdGDA">Token ID:</label>
        <input
          type="text"
          name="tokenIdGDA"
          id="tokenIdGDA"
          placeholder="000..."
          value={inputFields.tokenIdGDA}
          required
          onChange={handleInputChange}
        />
        <h2 className="mt-8">Number of Deployed Account:</h2>
        <p className="bg-slate-800 p-3 rounded-[20px] w-fit min-w-[6rem] text-center mb-8">
          {numDeployed}
        </p>
        <button
          onClick={() =>
            getTotalNumberOfDeployedAccounts({
              address: inputFields.tokenAddressGDA,
              id: inputFields.tokenIdGDA,
            })
          }
        >
          get number of deployed accounts
        </button>
      </div>
      <div className="w-full my-8 flex flex-col gap-4">
        <label htmlFor="tokenAddressGA">Token Address:</label>
        <input
          type="text"
          name="tokenAddressGA"
          id="tokenAddressGA"
          placeholder="0x0..."
          value={inputFields.tokenAddressGA}
          required
          onChange={handleInputChange}
        />
        <label htmlFor="tokenIdGA">Token ID:</label>
        <input
          type="text"
          name="tokenIdGA"
          id="tokenIdGA"
          placeholder="000..."
          value={inputFields.tokenIdGA}
          required
          onChange={handleInputChange}
        />
        <h2 className="mb-8 text-center">Address:</h2>
        <p className="bg-slate-800 p-3 rounded-[20px]  min-w-[6rem] text-center mb-8 w-[90vw] lg:w-[40vw]">
          {tbaAddress}
        </p>
        <button
          onClick={() =>
            getAccount({
              address: inputFields.tokenAddressGA,
              id: inputFields.tokenIdGA,
            })
          }
        >
          get account
        </button>
      </div>
    </main>
  );
}
