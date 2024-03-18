"use client";

import { Castle, D2, Dice, Logo, Menu, XLogo } from "@/assets/images";
import Button from "@/components/button/Button";
import ButtonContainer from "@/components/button/ButtonContainer";
import Layout from "@/components/layout/Layout";
import useWindowDimensions from "@/hooks/useDimensions";

import Image from "next/image";
import React, { useState } from "react";
import "./home.css";

function Homepage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  return (
    <Layout>
      <div className="home">
        <div className="castle__section">
          <div className="castle__section__text">
            <h3>Own the most lucrative business known to mankind</h3>
            <p>
              Unlike traditional betting platforms operated by centralised
              operators. New phoenix is decentralised autonomous organisation
              that allows the community to
              <span> have a share of the platform profits </span> through the
              buyback and burn of the PHGX tokens,
            </p>

            <div className="castle__section__listing">
              <h3>
                TOTAL REV. GENERATED: <span>$1.07m</span>
              </h3>

              <h3>
                TOKENS BURNED: <span>100,000</span>
              </h3>
            </div>
          </div>

          <div className="castle__section__image">
            <Image
              src={Castle}
              alt=""
              className="img"
              // style={{ width: 500, height: 500 }}
            />
          </div>
        </div>
        <div className="stake__view">
          <div className="stake__view__img">
            <Image
              alt=""
              src={D2}
              className="img"
              // style={{ width: 450, height: 450 }}
            />
          </div>

          <div className="stake__view__text">
            <h3>Stake More, Earn More!</h3>
            {isDesktop ? (
              <p>
                Buy <span>PHGX</span> and stake them for up to{" "}
                <span>25% APY</span>. The platform revenue will{" "}
                <span>buy back and burn</span> PHGX using platform profits.
              </p>
            ) : (
              <p>
                Be <span>rewarded in PHGX</span> tokens for your gaming
                activity. You can stake them and get a steady cashflow for your
                free roll. There’s never been a better way to feed your gambling
                addiction.
              </p>
            )}
          </div>
        </div>
        <div className="tvl">
          <div className="tvl__price">
            {isDesktop ? (
              <h3>
                TVL: <br />
                <span>$10,420,000</span>
              </h3>
            ) : (
              <h3>
                TOTAL STAKED: <br />
                <span> $1.08</span>
                <span style={{ fontSize: 22 }}>m</span>{" "}
                <span style={{ fontSize: 22 }}>PHGX</span>
              </h3>
            )}
          </div>

          <div className="tvl__percent">
            <h3>
              YIELD FARMING REWARDS: <br />
              {isDesktop ? (
                <span>25% APY</span>
              ) : (
                <span>
                  25% <span style={{ fontSize: 22 }}>APY</span>
                </span>
              )}
            </h3>
          </div>
        </div>
        <div className="dice__view">
          <div className="dice__view__text">
            <h3>Play More, Earn More!</h3>
            <p>
              Be <span>rewarded in PHGX</span> tokens for your gaming activity.
              You can stake them and get a steady cashflow for your free roll.
              There’s never been a better way to feed your gambling addiction.
            </p>
          </div>

          <div className="dice__view__img">
            <Image src={Dice} className="img" />
          </div>
        </div>
        <div className="supply">
          <div className="supply__price">
            <h3>
              CURRENT PRICE: <br />
              <span>$10.42</span>
            </h3>
          </div>

          <div className="supply__percent">
            <h3>
              TOTAL SUPPLY: <br />
              {isDesktop ? <span>$1,000,000,000</span> : <span>$1M</span>}
            </h3>
          </div>
        </div>
        <ButtonContainer>
          <Button text={"buy now"} />
        </ButtonContainer>
      </div>
    </Layout>
  );
}

export default Homepage;
