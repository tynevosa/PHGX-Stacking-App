import { Logo } from "@/assets/images";
import Image from "next/image";
import React from "react";
import "./Loading.css";

function Loading() {
  return (
    <div className="loading">
      <Image src={Logo} width={200} height={200} />
      <section>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </section>
    </div>
  );
}

export default Loading;
