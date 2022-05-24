// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract GoldenNFTMock is ERC1155 {
    uint256 public constant GOLDEN_TICKET_ID = 1;
    uint256 public constant GOLDEN_TICKET_SUPPLY = 100;

    constructor() public ERC1155("https://game.example/api/item/{id}.json") {
        _mint(msg.sender, GOLDEN_TICKET_ID, GOLDEN_TICKET_SUPPLY, "");
    }
}
