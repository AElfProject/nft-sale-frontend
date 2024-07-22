import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import ProfilePage from "./pages/profile";
import Header from "./components/layout/header";
import HomePage from "./pages/home";
import "./app.scss";
import CreateNftPage from "./pages/create-nft";
import TransferNftPage from "./pages/transfer-nft";

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [currentWalletAddress, setCurrentWalletAddress] = useState<string>();
  return (
    <div className="app-layout">
      <Header
        isConnected={isConnected}
        currentWalletAddress={currentWalletAddress}
        setIsConnected={setIsConnected}
        setCurrentWalletAddress={setCurrentWalletAddress}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-nft" element={<CreateNftPage />} />
        <Route path="/transfer-nft" element={<TransferNftPage />} />
        {isConnected && currentWalletAddress && (
          <Route
            path="/profile"
            element={
              <ProfilePage currentWalletAddress={currentWalletAddress} />
            }
          />
        )}
      </Routes>
    </div>
  );
};

export default App;
