import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useConfig,
  useBalance,
  usePublicClient,
  useWalletClient,
  useChainId,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract
} from "wagmi";
import { constants } from "@/const";
import tokenContractAbi from "@/abi/PHGXToken.json";
import stakingContractAbi from "@/abi/PHGXStaking.json";
import { formatEther, parseEther } from "viem";
import toast from 'react-hot-toast';

const useActiveWagmi = () => {
  const { address, connector, isConnecting, isConnected } = useAccount();
  const { chain, chains } = useConfig();
  const provider = usePublicClient();
  const { data: signer } = useWalletClient();
  const chainId = useChainId();
  const library = provider;
  
  const [plans, setPlans] = useState([]);
  const [stakingPlans, setStakingPlans] = useState([]);
  const [balance, setBalance] = useState('');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Read PHGX token balance
  const { refetch: getPHGXBalance } = useBalance({
    address: address,
    token: constants.tokenContractAddress,
    enabled: isConnected,
  })

  // Read all available stakable plans
  const { refetch: fetchPlans } = useReadContract({
    address: constants.stakingContractAddress,
    abi: stakingContractAbi,
    functionName: 'getPlans',
    enabled: isConnected,
  });

  // Read all staking plans
  const { refetch: fetchStakingPlans } = useReadContract({
    address: constants.stakingContractAddress,
    abi: stakingContractAbi,
    functionName: 'getStakers',
    account: address,
    enabled: isConnected,
  })

  // Check allowance
  const { refetch: checkAllowance } = useReadContract({
    address: constants.tokenContractAddress,
    abi: tokenContractAbi,
    functionName: "allowance",
    args: [address, constants.stakingContractAddress],
  })

  const { refetch: waitForTransactionReceipt } = useWaitForTransactionReceipt();

  // Approve function
  const { writeContractAsync: approve } = useWriteContract({
    mutation: {
      onSuccess(data) {
        toast.promise(waitForTransactionReceipt({ hash: data.hash }), {
          loading: 'Token allowance...',
          success: 'Done!',
          error: 'Failed!',
        });
      },
      onError(error) {
        toast.error(error.shortMessage);
      }
    }
  });

  // Staking function using useWriteContract hook from wagmi
  const { writeContractAsync: stakeWrite } = useWriteContract({
    mutation: {
      async onSuccess(data) {
        // wait for confirming transaction
        await toast.promise(waitForTransactionReceipt({ hash: data.hash }), {
          loading: 'Staking...',
          success: 'Stake successful!',
          error: 'Stake failed!',
        });
        // update information after staking
        await sleep(2000);
        await handleFetchPlans();
      },
      onError(error) {
        toast.error(error.shortMessage);
      }
    }
  });

  // Unstaking function
  const { writeContractAsync: unstakeWrite } = useWriteContract({
    mutation: {
      async onSuccess(data) {
        // wait for confirming transaction
        await toast.promise(waitForTransactionReceipt({ hash: data.hash }), {
          loading: 'Unstaking...',
          success: 'Unstake successful!',
          error: 'Unstake failed!',
        });
        // update information after unstaking
        await sleep(2000);
        await handleFetchPlans();
      },
      onError(error) {
        toast.error(error.shortMessage);
      }
    }
  });

  // Parse and set plans and staking plans from contractReads
  const handleFetchPlans = useCallback(async () => {
    setBalance('');
    const phgx = await getPHGXBalance();
    setBalance(phgx.data.formatted);
    setPlans([]);
    const { data: fetchedPlans } = await fetchPlans();
    const plans = fetchedPlans.map((plan, index) => ({
      id: index,
      label: Number(plan['unlockPeriod']) ? `${plan['unlockPeriod']} seconds lock up` : 'Flexible',
      duration: `${Number(plan['unlockPeriod']) ? plan['unlockPeriod'] : 'Anytime'}`,
      apy: `${plan['rewardRate']}`,
      minimalAmount: plan['minimalAmount']
    }));
    setPlans(plans);
    setStakingPlans([]);
    const { data: fetchedStakingPlans } = await fetchStakingPlans();
    const stakingPlans = fetchedStakingPlans.map((plan, index) => {
      const planId = Number(plan['planId']);
      const stakedAmount = parseFloat(formatEther(plan['amount']));
      return {
        id: index,
        label: plans[planId].label,
        unlockingTime: Number(plan['unlockingTime']),
        stake: stakedAmount,
        reward: stakedAmount*plans[planId].apy/100,
      };
    });
    setStakingPlans(stakingPlans);
  }, [getPHGXBalance, fetchPlans, fetchStakingPlans]);

  // Handle stake and unstake actions
  const handleStake = useCallback(async (stakeAmount, selectedPlan) => {
    if (!stakeAmount) {
      toast.error('Please enter an amount to stake');
      return;
    }
    const { data: allowance } = await checkAllowance();
    if (allowance === undefined || parseFloat(formatEther(allowance)) < +stakeAmount) {
      await approve({
        address: constants.tokenContractAddress,
        abi: tokenContractAbi,
        functionName: "approve",
        args: [constants.stakingContractAddress, parseEther(stakeAmount)],
      });
    }
    await stakeWrite({
      address: constants.stakingContractAddress,
      abi: stakingContractAbi,
      functionName: 'stake',
      args: [parseEther(stakeAmount), selectedPlan?.id],
    });
  }, [checkAllowance, approve, stakeWrite, address, isConnected]);

  const handleUnstake = useCallback(async (stakeAmount, selectedStakingPlan) => {
    if (selectedStakingPlan) {
      if (stakeAmount < selectedStakingPlan.stake) {
        return toast.error('Please unstake full amount');
      }
      await unstakeWrite({
        address: constants.stakingContractAddress,
        abi: stakingContractAbi,
        functionName: 'unstake',
        args: [selectedStakingPlan.id],
      });
    } else {
      toast.error('Invalid staking plan selected');
    }
  }, [unstakeWrite]);

  return {
    account: address,
    balance,
    isConnected,
    isConnecting,
    chain,
    chains,
    chainId,
    library,
    signer,
    connector,
    isNetworkSupported: !chain?.unsupported,
    handleStake,
    handleUnstake,
    plans,
    stakingPlans,
    handleFetchPlans,
  };
};

export default useActiveWagmi;
