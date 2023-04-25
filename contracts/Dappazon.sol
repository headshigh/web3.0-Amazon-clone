// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;
    string public name = "Dappazon";
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }
    struct Order {
        uint256 time;
        Item item;
    }
    mapping(uint256 => Item) public items;
    mapping(address => mapping(uint256 => Order)) public orders;
    mapping(address => uint256) public orderCount;
    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint cost, uint256 quantity);
    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function list(
        //used for listing a item i.e adding it to items map
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );
        items[_id] = item;
        //emit event
        emit List(_name, _cost, _stock);
    }

    function buy(uint256 _id) public payable {
        //fetch item
        Item memory item = items[_id];
        //require enough ether to buy
        require(msg.value >= item.cost);
        //require item is in stock
        require(item.stock > 0);
        Order memory order = Order(block.timestamp, item);
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        //the order will be like
        //'120xxbdj3a33'->1-ball 2-cat 3-mouse
        //subtract stock;
        items[_id].stock = item.stock - 1;
        //emit bought event buyer, nth order of buyer, item id
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
