"use client";

import React, { useEffect, useState } from "react";

import Footer from "@/components/footer/Footer";
import Loading from "@/components/loading/Loading";
import useWindowDimensions from "@/hooks/useDimensions";
import Image from "next/image";
import { Logo, Menu, XLogo } from "@/assets/images";
import "../../app/home/home.css";

const DesktopNav = () => {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="desktop__nav">
      <div className={`nav__flex ${hasScrolled ? "scroll" : ""}`}>
        <div className="desktop__nav__links">
          <ul>
            <div className="desktopLogo">
              <a href="/">
                <Image
                  src={Logo}
                  alt="logo"
                  style={{ width: 150, height: 136.17 }}
                />
              </a>{" "}
              <h3 className="logo__text">New Phoenix</h3>
            </div>
            <a href="/stake">
              <li>stake</li>
            </a>

            <a href="/">
              <li>earn</li>
            </a>

            <a href="/">
              <li>swap</li>
            </a>

            <a href="/">
              <li>tokenomics</li>
            </a>

            <a href="/">
              <li>play now!</li>
            </a>
          </ul>
        </div>
      </div>

      <div className="nav__body__text">
        <h2 className="nav__body__text__f">Rise from the ashes, degens...</h2>
        <p className="nav__body__text__s">
          A decentralised betting protocol owned by you!
        </p>
      </div>
    </div>
  );
};

const MobileNav = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto"; // Ensure overflow is reset when component unmounts
    };
  }, [showMenu]);

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
    if (!showMenu) {
      // If the menu is being opened, scroll to the top
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="mobile__nav">
      <div className={`mobile__nav__flex ${hasScrolled ? "scroll" : ""}`}>
        <div className="mobileLogo">
          <a href="/">
            <Image src={Logo} width={100} height={100} />
          </a>
          <h3 className="logo__text">New Phoenix</h3>
        </div>

        <div className="mobile__nav__menu__icon">
          <Image src={Menu} onClick={handleMenuClick} className="img" />
        </div>
      </div>

      <div className="nav__body__text">
        <h2 className="nav__body__text__f">Rise from the ashes, degens...</h2>
        <p className="nav__body__text__s">
          A decentralised betting protocol owned by you!
        </p>
      </div>

      {showMenu && (
        <div className="mobile__nav__menu">
          <div className="mobile__nav__x" onClick={() => setShowMenu(false)}>
            X
          </div>

          <div className="mobile__nav__links">
            <ul>
              <a href="/stake">
                <li>stake</li>
              </a>

              <a href="/">
                <li>earn</li>
              </a>

              <a href="/">
                <li>swap</li>
              </a>

              <a href="/">
                <li>tokenomics</li>
              </a>

              <a href="/">
                <li>play now!</li>
              </a>
            </ul>
          </div>

          <div className="mobile__nav__logo">
            <Image src={Logo} className="img" />
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  return (
    <>
      {width ? (
        <div className="app">
          {isDesktop ? <DesktopNav /> : <MobileNav />}
          {children}
          <Footer />
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Layout;
