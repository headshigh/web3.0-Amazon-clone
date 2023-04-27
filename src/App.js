import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Section from "./components/Section";
import Product from "./components/Product";

// ABIs
import DappazonAbi from "./abis/Dappazon.json";

// Config
import config from "./config.json";

function App() {
  const [Dappazon, setDappazon] = useState(null);
  const [provider, setProvider] = useState();
  const [electronics, setElectronics] = useState(null);
  const [clothing, setClothing] = useState(null);
  const [item, setItem] = useState({});
  const [toys, setToys] = useState(null);
  const [toggle, setToggle] = useState(false);
  const togglePop = (item) => {
    setItem(item);
    toggle ? setToggle(false) : setToggle(true);
  };
  // console.log("dappa contract", Dappazon);
  const loadBlockChainData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const network = await provider.getNetwork();
      console.log(config);
      const dappazon = new ethers.Contract(
        config[network.chainId].dappazon.address,
        DappazonAbi,
        provider
      );
      setDappazon(dappazon);
      const items = [];
      for (var i = 0; i < 9; i++) {
        const item = await dappazon.items(i + 1);
        items.push(item);
      }
      console.log(items, "items");
      const electronics = items.filter(
        (item) => item.category === "electronics"
      );
      const clothing = items.filter((item) => item.category === "clothing");
      const toys = items.filter((item) => item.category === "toys");
      setElectronics(electronics);
      setClothing(clothing);
      setToys(toys);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    console.log("hello");
    loadBlockChainData();
  }, []);
  const [account, setAccount] = useState(null);
  console.log("e", electronics);
  console.log("contract", Dappazon);
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      {electronics && clothing && toys && (
        <>
          <Section
            title={"Clothing & Jewelry"}
            items={clothing}
            togglePop={togglePop}
          />
          <Section
            title={"Electronics & Gadgets"}
            items={electronics}
            togglePop={togglePop}
          />
          <Section title={"Toys & Gaming"} items={toys} togglePop={togglePop} />
          {toggle && (
            <Product
              item={item}
              provider={provider}
              account={account}
              dappazon={Dappazon}
              togglePop={togglePop}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
