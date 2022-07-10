// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract Debate is Ownable {
    struct DebatePost {
        uint256 id;
        uint256 title;
        uint256 agreeComment;
        uint256 neutralComment;
        uint256 disagreeComment;
    }

    mapping (uint256 => DebatePost) private postWithId;

    DebatePost[] archive;

    event Archived(uint256 id, uint256 title);
    event Query(DebatePost post);
    constructor() {

    }



    function archiving (uint256 id, uint256 title, uint256 agreeComment, uint256 neturalComment, uint256 disagreeComment) external onlyOwner returns(bool) {
        require(!(postWithId[id].title > 0) , "post with corresponding id is already exist");
        DebatePost memory archived = DebatePost(id, title, agreeComment, neturalComment, disagreeComment);
        postWithId[id] = archived;
        archive.push(archived);
        emit Archived(id, title);
        return true;
    }

    function lookFor (uint256 id) public returns(uint256){
        emit Query(postWithId[id]);
        return postWithId[id].title;
    }


}