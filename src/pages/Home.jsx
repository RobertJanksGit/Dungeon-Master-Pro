import { useState } from "react";

import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="size-full p-4 sm:p-6 md:p-8">
      <div className="max-w-[1200px] mx-auto">
        <Header />
        <Main />
        <Footer />
      </div>
    </div>
  );
}
export default Home;
