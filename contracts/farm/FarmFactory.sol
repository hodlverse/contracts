// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IReserve.sol";
import "./Farm.sol";

contract FarmFactory is Ownable {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // The MONEY TOKEN!
    address public money;
    // Deposit Fee address
    address public feeAddress;
    // Reserve address
    address public reserve;
    // total farms
    uint256 private farmId;

    // Farm address for each LP token address.
    mapping(uint256 => address) public farms;
    mapping(address => address) public farmAddresses; // farm => farm lp token

    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocPoint;

    //round id to reward array
    uint256[] public rewards;
    uint256 public globalRoundId;

    //only after this time, rewards will be fetched and ditributed to the users from last date
    uint256 public reserveDistributionSchedule = 30 days;
    uint256 public lastReserveDistributionTimestamp;
    uint256 public depositPeriod = 24 hours;

    event NewPool(
        address indexed farm,
        IERC20 lpToken,
        uint256 allocPoint,
        uint16 depositFeeBP
    );
    event UpdatePool(
        address indexed farm,
        uint256 allocPoint,
        uint16 depositFeeBP
    );
    event SetFeeAddress(address indexed user, address indexed newAddress);
    event UpdatedReserveDistributionSchedule(
        uint256 _reserveDistributionSchedule
    );
    event SetReserveAddress(address _reserve);
    event RewardsAccumulated();

    modifier onlyFarm() {
        require(farmAddresses[msg.sender] != address(0), "NOT_FARM");
        _;
    }

    constructor(
        address _money,
        address _feeAddress,
        address _reserve
    ) public {
        require(
            _money != address(0),
            "FarmFactory:constructor:: ERR_ZERO_ADDRESS_MONEY"
        );
        require(
            _feeAddress != address(0),
            "FarmFactory:constructor:: ERR_ZERO_ADDRESS_FEE_ADDRESS"
        );
        require(
            _reserve != address(0),
            "FarmFactory:constructor:: ERR_ZERO_ADDRESS_RESERVE"
        );

        money = _money;
        feeAddress = _feeAddress;
        reserve = _reserve;
    }

    function poolLength() external view returns (uint256) {
        return farmId != 0 ? farmId - 1 : 0;
    }

    function getMoneyPerShare(uint256 _farmId, uint256 _round)
        external
        view
        returns (uint256)
    {
        return Farm(farms[_farmId]).getMoneyPerShare(_round);
    }

    function getPoolDeposits(uint256 _farmId, uint256 _round)
        external
        view
        returns (uint256)
    {
        return Farm(farms[_farmId]).getPoolDeposits(_round);
    }

    // Add a new farm. Can only be called by the owner.
    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        uint16 _depositFeeBP
    ) external onlyOwner {
        require(
            _depositFeeBP <= 10000,
            "FarmFactory:add:: INVALID_FEE_BASIS_POINTS"
        );
        require(_allocPoint != 0, "FarmFactory:add:: INVALID_ALLOC_POINTS");
        require(
            address(_lpToken) != address(0),
            "FarmFactory:add:: INVALID_LP_TOKEN"
        );

        if (totalAllocPoint == 0) {
            lastReserveDistributionTimestamp = depositPeriod.add(
                block.timestamp
            );
        }

        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        farmId = farmId + 1;

        Farm farm = new Farm(
            money,
            _allocPoint,
            _lpToken,
            _depositFeeBP,
            globalRoundId,
            farmId
        );

        farms[farmId] = address(farm);
        farmAddresses[address(farm)] = address(_lpToken);

        emit NewPool(address(farm), _lpToken, _allocPoint, _depositFeeBP);
    }

    // Update the given pool's MONEY allocation point and deposit fee. Can only be called by the owner.
    function set(
        uint256 _farmId,
        uint256 _allocPoint,
        uint16 _depositFeeBP
    ) external onlyOwner {
        require(
            _depositFeeBP <= 10000,
            "FarmFactory:set:: INVALID_FEE_BASIS_POINTS"
        );
        require(
            _farmId < farmId || farmId != 0,
            "FarmFactory:set:: INVALID_POOL_ID"
        );

        Farm farm = Farm(farms[_farmId]);
        totalAllocPoint = totalAllocPoint.sub(farm.allocPoint()).add(
            _allocPoint
        );
        farm.set(_allocPoint, _depositFeeBP);

        emit UpdatePool(farms[_farmId], _allocPoint, _depositFeeBP);
    }

    function getCurrentRoundId(uint256 _farmId)
        external
        view
        returns (uint256 depositForRound)
    {
        return Farm(farms[_farmId]).getCurrentRoundId();
    }

    function pendingMoney(uint256 _farmId, address _user)
        external
        view
        returns (uint256 pending)
    {
        return Farm(farms[_farmId]).pendingMoney(_user);
    }

    // Deposit LP tokens to MoneyFarm for MONEY allocation.
    function deposit(uint256 _farmId, uint256 _amount) external {
        Farm(farms[_farmId]).depositFor(msg.sender, _amount);
    }

    // Withdraw LP tokens from MoneyFarm.
    function withdraw(uint256 _farmId, uint256 _amount) external {
        Farm(farms[_farmId]).withdrawFor(msg.sender, _amount);
    }

    function pullRewards() external returns (uint256 rewardAccumulated) {
        require(
            lastReserveDistributionTimestamp.add(reserveDistributionSchedule) <=
                block.timestamp,
            "FarmFactory:pullRewards:: REWARDS_NOT_AVAILABLE_YET"
        );

        rewardAccumulated = IReserve(reserve).withdrawRewards();
        if (rewardAccumulated == 0) return rewardAccumulated;

        rewards.push(rewardAccumulated);
        globalRoundId = rewards.length.sub(1);

        lastReserveDistributionTimestamp = block.timestamp;

        emit RewardsAccumulated();
    }

    // Update reward variables of the given pool to be up-to-date.
    // call pull rewards before this (if not executed for the current round already)
    function getRewards(uint256 _round) external view returns (uint256) {
        return rewards[_round];
    }

    // Safe money transfer function, just in case if rounding error causes pool to not have enough MONEY Tokens.
    function safeMoneyTransfer(address _to, uint256 _amount) external onlyFarm {
        uint256 moneyBal = IERC20(money).balanceOf(address(this));
        bool transferSuccess = false;
        if (_amount > moneyBal) {
            transferSuccess = IERC20(money).transfer(_to, moneyBal);
        } else {
            transferSuccess = IERC20(money).transfer(_to, _amount);
        }
        require(
            transferSuccess,
            "FarmFactory:safeMoneyTransfer:: TRANSFER_FAILED"
        );
    }

    function setFeeAddress(address _feeAddress) external onlyOwner {
        feeAddress = _feeAddress;
        emit SetFeeAddress(msg.sender, _feeAddress);
    }

    function setReserveAddress(address _reserveAddress) external onlyOwner {
        reserve = _reserveAddress;
        emit SetReserveAddress(_reserveAddress);
    }

    function updateReserveDistributionSchedule(
        uint256 _reserveDistributionSchedule
    ) external onlyOwner {
        reserveDistributionSchedule = _reserveDistributionSchedule;
        emit UpdatedReserveDistributionSchedule(_reserveDistributionSchedule);
    }
}
