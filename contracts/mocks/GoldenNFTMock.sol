// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract GoldenNFTMock is ERC1155 {
    uint256 public constant THORS_HAMMER = 2;

    constructor() public ERC1155("https://game.example/api/item/{id}.json") {
        _mint(msg.sender, THORS_HAMMER, 1, "");
    }
}
