import "./App.css";
import { Routes, Route } from "react-router-dom";
import CreateProposal from "./CreateProposal";
import MarketPlace from "./marketPlace";
import ProfilePage from "./pages/profile";
import { Fragment, useState } from "react";
import Header from "./components/layout/header";

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>();
  return (
    <Fragment>
      <Header
        isConnected={isConnected}
        currentWalletAddress={currentWalletAddress}
        setIsConnected={setIsConnected}
        setCurrentWalletAddress={setCurrentWalletAddress}
      />
      <Routes>
        <Route path="/" element={<MarketPlace />}></Route>
        <Route path="/create-proposal" element={<CreateProposal />}></Route>
        {isConnected && currentWalletAddress && <Route
          path="/profile"
          element={
            <ProfilePage
              currentWalletAddress={currentWalletAddress}
            />
          }
        ></Route>}
      </Routes>
    </Fragment>
  );
}

export default App;
