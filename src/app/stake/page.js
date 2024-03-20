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
import { usePrivy } from "@privy-io/react-auth";
import { config } from "@/providers/config";

function Stake() {
  const { account, isConnected, balance } = useActiveWagmi();
  const [phgxBalance, setPhgxBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState();
  const [isStakeSelected, setIsStakeSelected] = useState(true);
  const [stakingPlans, setStakingPlans] = useState([]);
  const [unstakingPlans, setUnstakingPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [unstakeSelectedPlan, setUnstakeSelectedPlan] = useState(null);
  const { connectWallet } = usePrivy();

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

  const fetchPools = async () => {
    setStakingPlans([]);
    setSelectedPlan(null);
    setUnstakingPlans([]);
    setUnstakeSelectedPlan(null);
    try {
      const planCount = await readContract(config, {
        abi: stakingContractAbi,
        address: constants.stakingContractAddress,
        functionName: "planCount",
      });
      let plans = [];
      for( let i=0; i<planCount; i++ ) {
        const plan = await readContract(config, {
          abi: stakingContractAbi,
          address: constants.stakingContractAddress,
          functionName: "plans",
          args: [BigInt(i)],
        });
        plans.push({
          id: i,
          label: Number(BigInt(plan[1])) ? `${plan[1]} seconds lock up` : 'Flexible',
          duration: `${Number(BigInt(plan[1])) ? plan[1] : 'Anytime'}`,
          apy: `${plan[0]}`,
          minimalAmount: plan[2]
        });
      }
      setStakingPlans(plans);
      setSelectedPlan(plans[0]);
      try {
        let unPlans = [];
        const stakerInfo = await readContract(config, {
          abi: stakingContractAbi,
          address: constants.stakingContractAddress,
          functionName: "getStaker",
          account: account,
        });
        const planId = Number(BigInt(stakerInfo['planId']));
        const stakedAmount = parseFloat(formatEther(stakerInfo['amount']));
        unPlans.push({
          label: plans[planId].label,
          duration: `${stakerInfo['timeRemaining']}`,
          stake: `${stakedAmount}`,
          reward: `${stakedAmount*plans[planId].apy/100}`,
        });
        setUnstakingPlans(unPlans);
        setUnstakeSelectedPlan(unPlans[0]);
        countdownTimer(unPlans[0].duration);
      } catch (error) {
        // console.error("fetching staker information: ", error);
      }
    } catch (error) {
      // console.error("fetching Pools: ", error);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchPools();
      setPhgxBalance(balance);
    } else {
      // connectWallet();
    }
  }, [account, isConnected, balance]);

  const handleStake = async () => {
    if (stakeAmount < selectedPlan?.minimalAmount) return;
    const stakingAmount = stakeAmount;
    setStakeAmount(0);
    if (!isConnected) {
      connectWallet();
    } else {
      const allowance = await readContract(config, {
        address: constants.tokenContractAddress,
        abi: tokenContractAbi,
        functionName: "allowance",
        args: [account ?? `0x${""}`, constants.stakingContractAddress],
      });
      if (allowance !== undefined || Number(BigInt(allowance)) < +stakingAmount) {
        const approveTx = await writeContract(config, {
          abi: tokenContractAbi,
          address: constants.tokenContractAddress,
          functionName: "approve",
          args: [constants.stakingContractAddress, parseEther(stakingAmount)],
        });
        if (approveTx) {
          const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: approveTx,
          })
          const stakeTx = await writeContract(config, {
            address: constants.stakingContractAddress,
            abi: stakingContractAbi,
            functionName: "stake",
            args: [parseEther(stakingAmount), BigInt(selectedPlan.id)],
          })
          if (stakeTx) {
            await waitForTransactionReceipt(config, {
              hash: stakeTx,
            })
            setPhgxBalance(prevState => prevState-stakingAmount);
            fetchPools();
          }
        }
      } else {
        const stakeTx = await writeContract(config, {
          address: constants.stakingContractAddress,
          abi: stakingContractAbi,
          functionName: "stake",
          args: [parseEther(stakingAmount), BigInt(selectedPlan.id)],
        })
        if (stakeTx) {
          const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: stakeTx,
          })
          setPhgxBalance(prevState => prevState-stakingAmount);
          fetchPools();
        }
      }
      setStakeAmount(0);
    }
  }

  const handleUnstake = async () => {
    if (stakeAmount != unstakeSelectedPlan?.stake) return;
    setStakeAmount(0);
    if (!isConnected) {
      connectWallet();
    } else {
      // unstake
      const unstakeTx = await writeContract(config, {
        abi: stakingContractAbi,
        address: constants.stakingContractAddress,
        functionName: "unstake",
      });
      if (unstakeTx) {
        await waitForTransactionReceipt(config, {
          hash: unstakeTx,
        })
        fetchPools();
      }
      setStakeAmount(0);
    }
  }

  function countdownTimer(seconds) {
    if(seconds > 0){
      const unstakeInterval = setInterval(() => {
        seconds--;
        setUnstakeSelectedPlan(prevState => ({
          ...prevState,
          duration: seconds
        }));
        if (seconds === 0) {
          clearInterval(unstakeInterval);
        }
      }, 1000);
    }
  }

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
                      {unstakeSelectedPlan.duration}{"s"}
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
                style={{
                  opacity: isConnected ? unstakeSelectedPlan && unstakeSelectedPlan?.duration=='0' && unstakeSelectedPlan?.stake == stakeAmount ? 1 : 0.4 : 1,
                }}
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
    </Layout2>
  );
}

export default Stake;
