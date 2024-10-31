import Header from "../components/Header";
import DashboardMain from "../components/DashboardMain";
import Footer from "../components/Footer";

export default function Dashboard() {
  return (
    <div className="size-full">
      <Header />
      <DashboardMain />
      <Footer />
    </div>
  );
}
