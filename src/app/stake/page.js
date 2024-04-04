"use client";

// import { ethers } from "ethers";
import "./Stake.css";
import React, { useEffect, useCallback, useState } from "react";
import { Arrow } from "@/assets/images";
import Button from "@/components/button/Button";
import ButtonContainer from "@/components/button/ButtonContainer";
import Layout from "@/components/layout/Layout";
import Layout2 from "@/components/layout/Layout2";
import Image from "next/image";
import useActiveWagmi from "@/hooks/useActiveWagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { sepolia } from '@wagmi/core/chains'
import { Toaster } from 'react-hot-toast';

function Stake() {
  const { ready, authenticated, login, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const { 
    account,
    isConnected,
    balance,
    handleStake,
    handleUnstake,
    plans,
    stakingPlans,
    handleFetchPlans
  } = useActiveWagmi();
  const [phgxBalance, setPhgxBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStakeSelected, setIsStakeSelected] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedStakingPlan, setSelectedStakingPlan] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unlockingDuration, setUnlockingDuration] = useState(0);

  const Modal = useCallback(({ toggleModal, selectedPlan }) => {
    const handleDurationClick = (plan) => {
      toggleModal(plan);
    };

    return (
      <div className="modal">
        <div className="modal__content">
          {plans.map((plan, index) => {
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
  }, [plans]);

  const UnstakeModal = useCallback(({ toggleModal, selectedPlan }) => {
    const handleDurationClick = (duration) => {
      toggleModal(duration);
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
                </p>{" "}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [stakingPlans]);
  
  const toggleModal = (plan) => {
    setIsModalOpen(!isModalOpen);
    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const toggleUnstakeModal = (plan) => {
    setIsModalOpen(!isModalOpen);
    if (plan) {
      setSelectedStakingPlan(plan);
    }
  };

  useEffect(() => {
    if(plans.length) {
      setSelectedPlan(plans[0])
    }
    if(stakingPlans.length) {
      setSelectedStakingPlan(stakingPlans[0])
    }
  }, [plans, stakingPlans])

  useEffect(() => {
    if (isConnected) {
      wallets[0].switchChain(sepolia.id);
      handleFetchPlans();
      setPhgxBalance(parseFloat(balance).toFixed(1));
    }
  }, [account, isConnected, balance]);

  const handleOnStake = useCallback(async () => {
    console.log(authenticated, isConnected)
    if (!authenticated) {
      login();
      return
    }
    if (!isConnected) {
      connectWallet();
      return
    }
    await handleStake(stakeAmount, selectedPlan);
  }, [authenticated, isConnected, stakeAmount, selectedPlan])

  const handleOnUnstake = useCallback(async () => {
    console.log(authenticated, isConnected)
    if (!authenticated) {
      login();
      return
    }
    if (!isConnected) {
      connectWallet();
      return
    }
    await handleUnstake(stakeAmount, selectedStakingPlan);
  }, [authenticated, isConnected, stakeAmount, selectedStakingPlan])

  useEffect(() => {
    setUnlockingDuration(0);
    let seconds = selectedStakingPlan?.unlockingTime - Math.floor(Date.now() / 1000);
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
  }, [selectedStakingPlan]);

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
                <Button text={authenticated ? isConnected ? "stake" : "connect wallet" : "log in"} onClick={handleOnStake}/>
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
                    color: selectedStakingPlan
                      ? "var(--light-orange)"
                      : "white",
                    opacity: selectedStakingPlan ? 1 : 0.6,
                  }}
                >
                  {selectedStakingPlan
                    ? selectedStakingPlan.label
                    : "Choose a pool"}
                </p>
                <Image alt="Image" src={Arrow} width={15} height={15} />
              </div>

              {/* Modal */}
              {isModalOpen && (
                <UnstakeModal
                  toggleModal={toggleUnstakeModal}
                  selectedPlan={selectedStakingPlan}
                />
              )}

              {selectedStakingPlan && !isModalOpen ? (
                <div className="duration__list unstake">
                  <p>
                    Unlocking in:{" "}
                    <p className="duration">
                      {" "}
                      {unlockingDuration}{"s"}
                    </p>
                  </p>

                  <p>
                    Principal: <span> {selectedStakingPlan.stake} </span>{" "}
                    {selectedStakingPlan.balance == 0 && (
                      <span
                        style={{ textDecoration: "underline", fontSize: 12 }}
                      >
                        {" "}
                        BUY PHGX
                      </span>
                    )}
                  </p>

                  <p>
                    Reward: <span> {selectedStakingPlan.reward} </span>
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
                <p onClick={() => setStakeAmount(selectedStakingPlan?.stake)}>
                  max
                </p>
              </div>

              <div
                className="stake__btn"
                // style={{ opacity: isConnected ? selectedStakingPlan && unlockingDuration==0 && selectedStakingPlan?.stake == stakeAmount ? 1 : 0.4 : 1, }}
              >
                <Button
                  text={authenticated ? isConnected ? "withdraw" : "connect wallet" : "log in"} onClick={handleOnUnstake}
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
