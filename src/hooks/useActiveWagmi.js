import {
  useAccount,
  useNetwork,
  useBalance,
  usePublicClient,
  useWalletClient,
} from "wagmi";
import { constants } from "@/const";

const useActiveWagmi = () => {
  const { address, connector, isConnecting, isConnected } = useAccount();
  const balance = useBalance({
    address: address,
    token: constants.tokenContractAddress, 
  })
  const { chain, chains } = useNetwork();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();
  const chainId = chain?.id;
  const library = provider;

  return {
    account: address,
    balance: balance.data?.formatted,
    isConnected,
    isConnecting,
    chain,
    chains,
    chainId,
    library,
    signer,
    connector,
    isNetworkSupported: !chain?.unsupported,
  };
};

export default useActiveWagmi;
