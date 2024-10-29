import { useState } from "react";

import Header from "../components/Header";
import Main from "../components/Main";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="size-full">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
export default Home;
