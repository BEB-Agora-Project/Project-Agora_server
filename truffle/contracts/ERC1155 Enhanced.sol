// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Counters.sol";

contract AgoraTokens is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint256 public constant AgoraToken = 1;
    uint256 public constant testNFT = 2;
    uint256 internal nonce = 0;
    mapping (uint256 => uint256) private tokenPrice;
    mapping (uint256 => address) private tokenOwner;


    
    event BurnedToken(address[] fromArr, uint256[] amount);
    event MintedToken(address[] toArr, uint256[] amount);
    event MintedNFT(uint256 tokenId, uint256 price);
    event UserNFTBuy(address buyer, uint256 tokenId, uint256 price);
    event UserNFTFail(address buyer, uint256 tokenId, uint256 price);
    

    constructor() ERC1155("https://nftjson1123.herokuapp.com/agora/{tokenId}") {
        _tokenIds.increment();
        _tokenIds.increment();
        tokenOwner[2] = msg.sender;
        tokenPrice[2] = 100;
        _mint(msg.sender, AgoraToken, 10**27, "");
        _mint(msg.sender, testNFT, 1, "");
    }

    function tokenMint(address[] calldata toArr, uint256[] calldata amountArr) public onlyOwner returns (bool){
        require(toArr.length == amountArr.length, "receiver and amount array length is different");
        for(uint256 i = 0; i < toArr.length; i++) {
            require(toArr[i] != address(0x0));
            require(amountArr[i] > 0);
            _mint(toArr[i], AgoraToken, amountArr[i], "");
            }
        emit MintedToken(toArr, amountArr);
        return true;
    }

    function tokenBurn (address[] calldata fromArr, uint256[] calldata amountArr) public onlyOwner returns (bool){
        require(fromArr.length == amountArr.length, "receiver and amount array length is different");
        for(uint256 i = 0; i < fromArr.length; i++) {
            require(fromArr[i] != address(0x0));
            require(amountArr[i] > 0);
            _burn(fromArr[i], AgoraToken, amountArr[i]);
            
        }
        emit BurnedToken(fromArr, amountArr);
        return true;
    }

    function mintNFT (uint256 price) external onlyOwner returns(bool){
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId, 1, "");
        tokenPrice[newItemId] = price;
        tokenOwner[newItemId] = msg.sender;

        emit MintedNFT(newItemId, price);
        return true;
    }

    function buyNFT (address buyer, uint256 tokenId, uint256 price) external onlyOwner returns(bool){
        require(tokenId <= _tokenIds.current(), "Corresponding token does not exist");
        require(price >= tokenPrice[tokenId], "Not enough payment");
         uint256 diceResult = _randomDice();
        _burn(buyer, AgoraToken, price);

         if(diceResult <=10) {
        safeTransferFrom(msg.sender, buyer, tokenId, 1, "");
        tokenPrice[tokenId] = price;
        tokenOwner[tokenId] = buyer;
        emit UserNFTBuy(buyer, tokenId, price);

        return true;
         }
         else{
        emit UserNFTFail(buyer, tokenId, price);
        return false;
         }
    }
    
    function ownerOfNFT (uint256 tokenId) external view returns(address){
        return tokenOwner[tokenId];
    }


    //수도 랜덤입니다, 절대 사용하지 마세요
    function _randomDice () internal returns (uint256) {
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp,block.difficulty,nonce))) % 100;
        randomNumber = randomNumber + 1;
        nonce++;

        return randomNumber;
    }


}