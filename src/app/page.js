"use client";
import { Logo, XLogo } from "@/assets/images";
import Footer from "@/components/footer/Footer";
import Loading from "@/components/loading/Loading";
import useWindowDimensions from "@/hooks/useDimensions";
import Image from "next/image";
import Homepage from "./home/page";

export default function Home() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 800;

  return (
    <>
      {width ? (
        <div className="app">
          <Homepage />
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
