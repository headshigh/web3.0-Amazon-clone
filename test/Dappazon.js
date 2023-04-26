const { expect } = require("chai");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};
const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE =
  "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;
describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;
  beforeEach(async () => {
    //ssetup account
    [deployer, buyer] = await ethers.getSigners();
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });
  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });
  describe("Listing", () => {
    let transaction;
    beforeEach(async () => {
      //list a item;
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
    });
    it("Returns item attributes", async () => {
      const item = await dappazon.items(ID);
      expect(item.id).to.equal(ID);
      expect(item.name).to.equal(NAME);
      expect(item.category).to.equal(CATEGORY);
      expect(item.image).to.equal(IMAGE);
      expect(item.cost).to.equal(COST);
      expect(item.rating).to.equal(RATING);
      expect(item.stock).to.equal(STOCK);

      it("Emits List event", async () => {
        expect(transaction).to.emit(dappazon, "List");
      });
    });
  });
  describe("Buying", () => {
    let transaction;
    beforeEach(async () => {
      //daapzon references to the smart contract , we have imported it here using ethers.getContractFactory("Dappazon") method ; connected to smart contract on the blockchain using connect(deployer) method deployer is retrived from  ethers.getSigners() method that returns deployer and a buyer dummy account  provided by hardhat, list(parameters) used smart contract's list method that takes necessary parameters and lists items and returns object transaction..
      //list a item first because you need to have listed an item to buy it
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      //buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();
    });
    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address);
      expect(result).to.equal(1);
    });
    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1); //map
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });
    it("Updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(COST);
    });
    it("Emits Buy event", () => {
      expect(transaction).to.emit(dappazon, "Buy");
    });
  });
  describe("Withdrawing", async () => {
    let balanceBefore;
    beforeEach(async () => {
      //list a item first because you need to have listed an item to buy it
      let transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      //buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();
      balanceBefore = await ethers.provider.getBalance(deployer.address);
      //withdraw
      transaction = await dappazon.connect(deployer).withdraw();
      await transaction.wait();
    });
    it("Updates the owner balance", async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });
    //the contract should not have hold any balance it should have passed it to the buyer
    it("updates the contract balance", async () => {
      const result = await ethers.provider.getBalance(dappazon.address);
      expect(result).to.equal(0);
    });
  });
});
