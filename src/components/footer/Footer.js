import { Certik } from "@/assets/images";
import Image from "next/image";
import React from "react";
import Button from "../button/Button";
import "./Footer.css";

function Footer() {
  return (
    <div className="footer">
      <div className="footer__centered">
        <Button
          text={"play now!"}
          bg={"#24252a"}
          color={"var(--light-orange)"}
          fontWeight={700}
        />

        <h3 className="go__desktop">Let’s fucking go!</h3>
        <h3 className="go__mobile">LFG!</h3>

        <div className="boxes">
          <div> </div>
          <div></div>

          <div></div>

          <div></div>

          <div></div>
        </div>
      </div>

      <div className="certik">
        <p>Smart contract audited by:</p>
        <Image src={Certik} className="footer__cervik__img" alt="" />
        <p className="footer__c">© New Phoenix LLC 2024</p>
      </div>
    </div>
  );
}

export default Footer;
