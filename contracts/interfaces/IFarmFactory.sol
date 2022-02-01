// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IFarmFactory {
    // The MONEY TOKEN!
    function money() external view returns (address);

    // Deposit Fee address
    function feeAddress() external view returns (address);

    // Reserve address
    function reserve() external view returns (address);

    // Total allocation points. Must be the sum of all allocation points in all pools.
    function totalAllocPoint() external view returns (uint256);

    //round id to reward array
    function rewards() external view returns (uint256[] memory);

    function globalRoundId() external view returns (uint256);

    // Farm address for each LP token address.
    function farms(uint256) external view returns (address);

    // farm => farm lp token
    function farmAddresses(address) external view returns (address);

    function reserveDistributionSchedule() external view returns (uint256);

    function lastReserveDistributionTimestamp() external view returns (uint256);

    function depositPeriod() external view returns (uint256);

    function poolLength() external view returns (uint256);

    function getMoneyPerShare(uint256 _farmId, uint256 _round)
        external
        view
        returns (uint256);

    function getPoolDeposits(uint256 _farmId, uint256 _round)
        external
        view
        returns (uint256);

    function getCurrentRoundId(uint256 _farmId)
        external
        view
        returns (uint256 depositForRound);

    function pendingMoney(uint256 _farmId, address _user)
        external
        view
        returns (uint256 pending);

    function deposit(uint256 _farmId, uint256 _amount) external;

    function withdraw(uint256 _farmId, uint256 _amount) external;

    function pullRewards() external returns (uint256 rewardAccumulated);

    function getRewards(uint256 _round) external view returns (uint256);

    function safeMoneyTransfer(address _to, uint256 _amount) external;
}
