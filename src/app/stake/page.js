"use client";

// import { ethers } from "ethers";
import "./Stake.css";
import React, { useEffect, useRef, useState } from "react";
import { Arrow } from "@/assets/images";
import Button from "@/components/button/Button";
import ButtonContainer from "@/components/button/ButtonContainer";
import Layout from "@/components/layout/Layout";
import Layout2 from "@/components/layout/Layout2";
import Image from "next/image";
import useActiveWagmi from "@/hooks/useActiveWagmi";
import { writeContract, readContract, waitForTransactionReceipt } from "@wagmi/core";
import { formatEther, parseEther } from "viem";
import tokenContractAbi from "@/abi/PHGXToken.json";
import stakingContractAbi from "@/abi/PHGXStaking.json";
import { constants } from "@/const";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { config } from "@/providers/config";
import { sepolia } from '@wagmi/core/chains'
import toast, { Toaster } from 'react-hot-toast';

function Stake() {
  const { ready, authenticated, login, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { account, isConnected, balance } = useActiveWagmi();
  const [phgxBalance, setPhgxBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState();
  const [isStakeSelected, setIsStakeSelected] = useState(true);
  const [stakingPlans, setStakingPlans] = useState([]);
  const [unstakingPlans, setUnstakingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [unstakeSelectedPlan, setUnstakeSelectedPlan] = useState(null);
  const [unlockingDuration, setUnlockingDuration] = useState(0);

  const Modal = ({ toggleModal, selectedPlan }) => {
    const handleDurationClick = (plan) => {
      toggleModal(plan);
    };

    return (
      <div className="modal">
        <div className="modal__content">
          {stakingPlans.map((plan, index) => {
            return (
              <div
                key={index}
                onClick={() => handleDurationClick(plan)}
                className="modal__content__option"
              >
                <p
                  style={{
                    color:
                      selectedPlan === plan ? "var(--light-orange)" : "#fff",
                  }}
                >
                  {selectedPlan === plan ? plan.label + " ✓" : plan.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const UnstakeModal = ({ toggleModal, selectedPlan }) => {
    const handleDurationClick = (duration) => {
      toggleModal(duration);
    };
  
    return (
      <div className="modal">
        <div className="modal__content">
          {unstakingPlans.map((plan, index) => {
            return (
              <div
                key={index}
                onClick={() => handleDurationClick(plan)}
                className="modal__content__option"
              >
                <p
                  style={{
                    color:
                      selectedPlan === plan ? "var(--light-orange)" : "#fff",
                  }}
                >
                  {selectedPlan === plan ? plan.label + " ✓" : plan.label}
                </p>{" "}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const toggleModal = (plan) => {
    setIsModalOpen(!isModalOpen);
    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const toggleUnstakeModal = (plan) => {
    setIsModalOpen(!isModalOpen);
    if (plan) {
      setUnstakeSelectedPlan(plan);
    }
  };

  const updatePlans = async () => {
    try {
      let plans = await readContract(config, {
        abi: stakingContractAbi,
        address: constants.stakingContractAddress,
        functionName: "getPlans",
      });
      plans = plans.map((plan, index) => ({
        id: index,
        label: Number(plan['unlockPeriod']) ? `${plan['unlockPeriod']} seconds lock up` : 'Flexible',
        duration: `${Number(plan['unlockPeriod']) ? plan['unlockPeriod'] : 'Anytime'}`,
        apy: `${plan['rewardRate']}`,
        minimalAmount: plan['minimalAmount']
      }));
      setStakingPlans(plans);
      setSelectedPlan(plans[0]);
      let unPlans = await readContract(config, {
        abi: stakingContractAbi,
        address: constants.stakingContractAddress,
        functionName: "getStakers",
        account: account,
      });
      unPlans = unPlans.map((unPlan, index) => {
        const planId = Number(unPlan['planId']);
        const stakedAmount = parseFloat(formatEther(unPlan['amount']));
        return {
          id: index,
          label: plans[planId].label,
          unlockingTime: `${unPlan['unlockingTime']}`,
          stake: `${stakedAmount}`,
          reward: `${stakedAmount*plans[planId].apy/100}`,
        };
      })
      setUnstakingPlans(unPlans);
      setUnstakeSelectedPlan(unPlans[0]);
    } catch (error) {
      // console.error("fetching Pools: ", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      wallets[0].switchChain(sepolia.id);
      updatePlans();
      setPhgxBalance(parseFloat(balance).toFixed(1));
    } else {
      // login();
    }
  }, [account, isConnected, balance]);

  const handleStake = async () => {
    if (!isConnected) {
      if(!authenticated){
        login();
      } else {
        connectWallet();
      }
    } else {
      // check if user set higher amount of stake than minimal one of selected staking plan
      if (stakeAmount < selectedPlan?.minimalAmount) {
        toast.error(`Minimal stake amount is ${selectedPlan?.minimalAmount} PHGX`);
        return;
      };
      // check allowence of the token transfer to smart contract
      const allowance = await readContract(config, {
        address: constants.tokenContractAddress,
        abi: tokenContractAbi,
        functionName: "allowance",
        args: [account ?? `0x${""}`, constants.stakingContractAddress],
      });
      // if not allowed to transfer token, allow it
      if (allowance !== undefined || Number(allowance) < +stakeAmount) {
        const approveTx = await toast.promise(writeContract(config, {
          abi: tokenContractAbi,
          address: constants.tokenContractAddress,
          functionName: "approve",
          args: [constants.stakingContractAddress, parseEther(stakeAmount)],
        }),{
          loading: 'Approving...',
          success: <b>Approved!</b>,
          error: <b>Not approved.</b>,
        })
        if (approveTx) {
          await toast.promise(waitForTransactionReceipt(config, {
            hash: approveTx,
          }),{
            loading: 'Confirming transaction...',
            success: <b>Confirmed!</b>,
            error: <b>Not confirmed.</b>,
          })
        }
      }
      // call stake function with amount & selected staking plan id
      const stakeTx = await toast.promise(writeContract(config, {
        address: constants.stakingContractAddress,
        abi: stakingContractAbi,
        functionName: "stake",
        args: [parseEther(stakeAmount), BigInt(selectedPlan.id)],
      }),{
        loading: 'Stacking...',
        success: <b>Approved!</b>,
        error: <b>Not approved.</b>,
      })
      // if transaction created, wait it until confirmed
      if (stakeTx) {
        await toast.promise(waitForTransactionReceipt(config, {
          hash: stakeTx,
        }),{
          loading: 'Confirming transaction...',
          success: <b>Confirmed!</b>,
          error: <b>Not confirmed.</b>,
        })
        // after transaction confirmed, update status of staker
        setPhgxBalance(prevState => prevState-stakeAmount);
        setStakeAmount(0);
        updatePlans();
      }
    }
  }

  const handleUnstake = async () => {
    if (!isConnected) {
      if(!authenticated){
        login();
      } else {
        connectWallet();
      }
    } else {
      // user has to unstake full amount of the plan
      if (stakeAmount != unstakeSelectedPlan?.stake) {
        toast.error('Unstake full amount.');
        return;
      }
      // call unstake function with selected unstake plan
      const unstakeTx = await toast.promise(writeContract(config, {
        abi: stakingContractAbi,
        address: constants.stakingContractAddress,
        functionName: "unstake",
        args: [unstakeSelectedPlan.id],
      }),{
        loading: 'Unstaking...',
        success: <b>Approved!</b>,
        error: <b>Not approved.</b>,
      });
      // if transaction created, wait it until confirmed
      if (unstakeTx) {
        await toast.promise(waitForTransactionReceipt(config, {
          hash: unstakeTx,
        }),{
          loading: 'Confirming transaction...',
          success: <b>Confirmed!</b>,
          error: <b>Not confirmed.</b>,
        })
        // after transaction confirmed, update status of staker
        setStakeAmount(0);
        updatePlans();
      }
    }
  }

  useEffect(() => {
    setUnlockingDuration(0);
    let seconds = unstakeSelectedPlan?.unlockingTime - Math.floor(Date.now() / 1000);
    if (seconds > 0) {
      const unstakeInterval = setInterval(() => {
        seconds--;
        setUnlockingDuration(seconds);
        if (seconds === 0) {
          clearInterval(unstakeInterval);
        }
      }, 1000);
      return () => clearInterval(unstakeInterval);
    }
}, [unstakeSelectedPlan]);

  return (
    <Layout2>
      <div className="stake">
        <div className="stake__header">
          <h3>staking</h3>
          <p>
            Stake your PHGX at <span>20% APY</span>. Each PHGX represents a
            share of the platform revenue which you can claim as USDT at certain
            windows.
          </p>
        </div>

        <div className="stake__box">
          <div className="stake__box__heads">
            <h3
              onClick={() => {setIsStakeSelected(true); setStakeAmount(0)}}
              className={isStakeSelected && "active"}
            >
              stake
            </h3>
            <h3
              onClick={() => setIsStakeSelected(false)}
              className={!isStakeSelected && "active"}
            >
              unstake
            </h3>
          </div>

          {isStakeSelected ? (
            <section>
              <div className="stake__box__body">
                <p>
                  APY : <span> {selectedPlan && selectedPlan.apy}% </span>
                </p>
              </div>

              <div className="box__dropdown" onClick={() => toggleModal()}>
                <p
                  style={{
                    color: selectedPlan ? "var(--light-orange)" : "white",
                    opacity: selectedPlan ? 1 : 0.6,
                  }}
                >
                  {selectedPlan
                    ? selectedPlan.label
                    : "Choose your lock up period"}
                </p>
                <Image alt="Image" src={Arrow} width={15} height={15} />
              </div>

              {/* Modal */}
              {isModalOpen && (
                <Modal
                  toggleModal={toggleModal}
                  selectedPlan={selectedPlan}
                />
              )}

              {selectedPlan && !isModalOpen ? (
                <div className="duration__list">
                  <p>
                    Unlocking: <span> {selectedPlan.duration} </span>
                  </p>

                  <p>
                    Your Balance: <span> {phgxBalance} </span>{" "}
                    {phgxBalance == 0 && (
                      <span
                        style={{ textDecoration: "underline", fontSize: 12 }}
                      >
                        {" "}
                        BUY PHGX
                      </span>
                    )}
                  </p>
                </div>
              ) : null}

              <div className={`box__dropdown max ${isModalOpen ? "open" : ""}`}>
                <input
                  type={"text"}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="stake__input"

                />
                <p onClick={() => setStakeAmount(phgxBalance)}>max</p>
              </div>

              <div
                className="stake__btn"
                style={{ opacity: isConnected ? selectedPlan && stakeAmount >= parseFloat(selectedPlan?.minimalAmount) && stakeAmount <= phgxBalance ? 1 : 0.4 : 1}}
              >
                <Button text={isConnected ? "stake" : "connect wallet"} onClick={handleStake}/>
              </div>
            </section>
          ) : (
            <section>
              {/* <div className="stake__box__body">
                <p>
                  APY : <span> 25% </span>
                </p>
              </div> */}

              <div className="box__dropdown" onClick={() => toggleModal()}>
                <p
                  style={{
                    color: unstakeSelectedPlan
                      ? "var(--light-orange)"
                      : "white",
                    opacity: unstakeSelectedPlan ? 1 : 0.6,
                  }}
                >
                  {unstakeSelectedPlan
                    ? unstakeSelectedPlan.label
                    : "Choose a pool"}
                </p>
                <Image alt="Image" src={Arrow} width={15} height={15} />
              </div>

              {/* Modal */}
              {isModalOpen && (
                <UnstakeModal
                  toggleModal={toggleUnstakeModal}
                  selectedPlan={unstakeSelectedPlan}
                />
              )}

              {unstakeSelectedPlan && !isModalOpen ? (
                <div className="duration__list unstake">
                  <p>
                    Unlocking in:{" "}
                    <p className="duration">
                      {" "}
                      {unlockingDuration}{"s"}
                    </p>
                  </p>

                  <p>
                    Principal: <span> {unstakeSelectedPlan.stake} </span>{" "}
                    {unstakeSelectedPlan.balance == 0 && (
                      <span
                        style={{ textDecoration: "underline", fontSize: 12 }}
                      >
                        {" "}
                        BUY PHGX
                      </span>
                    )}
                  </p>

                  <p>
                    Reward: <span> {unstakeSelectedPlan.reward} </span>
                  </p>
                </div>
              ) : null}

              <div className={`box__dropdown max ${isModalOpen ? "open" : ""}`}>
                <input
                  type={"text"}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="stake__input"
                />
                <p onClick={() => setStakeAmount(unstakeSelectedPlan?.stake)}>
                  max
                </p>
              </div>

              <div
                className="stake__btn"
                // style={{ opacity: isConnected ? unstakeSelectedPlan && unlockingDuration==0 && unstakeSelectedPlan?.stake == stakeAmount ? 1 : 0.4 : 1, }}
              >
                <Button
                  text={isConnected ? "withdraw" : "connect wallet"} onClick={handleUnstake}
                />
              </div>
            </section>
          )}
        </div>
        <div className="copy__right">© New Phoenix LLC 2024</div>
      </div>
      <Toaster />
    </Layout2>
  );
}

export default Stake;
