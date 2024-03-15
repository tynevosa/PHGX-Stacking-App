"use client";

import { Arrow } from "@/assets/images";
import Button from "@/components/button/Button";
import ButtonContainer from "@/components/button/ButtonContainer";
import Layout from "@/components/layout/Layout";
import Layout2 from "@/components/layout/Layout2";
import Image from "next/image";
import React, { useState } from "react";
import "./Stake.css";

const durationOptions = [
  {
    label: "3 months lock up",
    duration: "3 months",
    date: "23/05/2024",
    balance: 1000000,
    apy: 25,
  },

  {
    label: "Flexible",
    duration: "Anytime",
    date: "23/05/2024",
    balance: 1000000,
    apy: 6,
  },

  // Add more duration options as needed
];

const unstakeOptions = [
  {
    label: "PHGX Pool 1",
    duration: "15: 00: 00",
    stake: 1000000,
    principal: 1000000,
    reward: 100000,
  },

  {
    label: "Flexible",
    duration: "Anytime",
    stake: 1000000,
    principal: 1000000,
    reward: 100000,
  },
];

const Modal = ({ toggleModal, selectedOption }) => {
  const handleDurationClick = (option) => {
    toggleModal(option);
  };

  return (
    <div className="modal">
      <div className="modal__content">
        {durationOptions.map((option, index) => {
          return (
            <div
              key={index}
              onClick={() => handleDurationClick(option)}
              className="modal__content__option"
            >
              <p
                style={{
                  color:
                    selectedOption === option ? "var(--light-orange)" : "#fff",
                }}
              >
                {selectedOption === option ? option.label + " ✓" : option.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UnstakeModal = ({ toggleModal, selectedOption }) => {
  const handleDurationClick = (duration) => {
    toggleModal(duration);
  };

  return (
    <div className="modal">
      <div className="modal__content">
        {unstakeOptions.map((option, index) => {
          return (
            <div
              key={index}
              onClick={() => handleDurationClick(option)}
              className="modal__content__option"
            >
              <p
                style={{
                  color:
                    selectedOption === option ? "var(--light-orange)" : "#fff",
                }}
              >
                {selectedOption === option ? option.label + " ✓" : option.label}
              </p>{" "}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function Stake() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [maxValue, setMaxValue] = useState(1.1);
  const [isStakeSelected, setIsStakeSelected] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [unstakeSelectedOption, setUnstakeSelectedOption] = useState(null);

  const toggleModal = (option) => {
    setIsModalOpen(!isModalOpen);
    if (option) {
      setSelectedOption(option);
    }
  };

  const toggleUnstakeModal = (option) => {
    setIsModalOpen(!isModalOpen);
    if (option) {
      setUnstakeSelectedOption(option);
    }
  };

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
              onClick={() => setIsStakeSelected(true)}
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
                  APY : <span> {selectedOption && selectedOption.apy}% </span>
                </p>
              </div>

              <div className="box__dropdown" onClick={() => toggleModal()}>
                <p
                  style={{
                    color: selectedOption ? "var(--light-orange)" : "white",
                    opacity: selectedOption ? 1 : 0.6,
                  }}
                >
                  {selectedOption
                    ? selectedOption.label
                    : "Choose your lock up period"}
                </p>
                <Image src={Arrow} width={15} height={15} />
              </div>

              {/* Modal */}
              {isModalOpen && (
                <Modal
                  toggleModal={toggleModal}
                  selectedOption={selectedOption}
                />
              )}

              {selectedOption && !isModalOpen ? (
                <div className="duration__list">
                  <p>
                    Unlocking: <span> {selectedOption.duration} </span>
                  </p>

                  <p>
                    Your Balance: <span> {selectedOption.balance} </span>{" "}
                    {selectedOption.balance == 0 && (
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
                  value={selectedOption?.balance > 0 ? maxValue : 0}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="stake__input"
                />
                <p onClick={() => setMaxValue(selectedOption?.balance)}>max</p>
              </div>

              <div
                className="stake__btn"
                style={{ opacity: selectedOption?.balance > 0 ? 1 : 0.4 }}
              >
                <Button text={selectedOption ? "stake" : "connect wallet"} />
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
                    color: unstakeSelectedOption
                      ? "var(--light-orange)"
                      : "white",
                    opacity: unstakeSelectedOption ? 1 : 0.6,
                  }}
                >
                  {unstakeSelectedOption
                    ? unstakeSelectedOption.label
                    : "Choose a pool"}
                </p>
                <Image src={Arrow} width={15} height={15} />
              </div>

              {/* Modal */}
              {isModalOpen && (
                <UnstakeModal
                  toggleModal={toggleUnstakeModal}
                  selectedOption={unstakeSelectedOption}
                />
              )}

              {unstakeSelectedOption && !isModalOpen ? (
                <div className="duration__list unstake">
                  <p>
                    Unlocking in:{" "}
                    <p className="duration">
                      {" "}
                      {unstakeSelectedOption.duration}{" "}
                    </p>
                  </p>

                  <p>
                    Principal: <span> {unstakeSelectedOption.principal} </span>{" "}
                    {unstakeSelectedOption.balance == 0 && (
                      <span
                        style={{ textDecoration: "underline", fontSize: 12 }}
                      >
                        {" "}
                        BUY PHGX
                      </span>
                    )}
                  </p>

                  <p>
                    Reward: <span> {unstakeSelectedOption.reward} </span>
                  </p>
                </div>
              ) : null}

              <div className={`box__dropdown max ${isModalOpen ? "open" : ""}`}>
                <input
                  type={"text"}
                  value={unstakeSelectedOption?.balance > 0 ? maxValue : 0}
                  onChange={(e) => setMaxValue(e.target.value)}
                  className="stake__input"
                />
                <p onClick={() => setMaxValue(unstakeSelectedOption?.balance)}>
                  max
                </p>
              </div>

              <div
                className="stake__btn"
                style={{
                  opacity: unstakeSelectedOption?.balance > 0 ? 1 : 0.4,
                }}
              >
                <Button
                  text={unstakeSelectedOption ? "withdraw" : "connect wallet"}
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
