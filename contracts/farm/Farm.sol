// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IReserve.sol";
import "../interfaces/IFarmFactory.sol";

contract Farm is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    // Info of each user.
    struct UserInfo {
        uint256 amount;
        uint256 entryFarmRound;
    }

    IERC20 public lpToken; // Address of LP token contract.
    uint16 public depositFeeBP; // Deposit fee in basis points

    uint256 public allocPoint; // How many allocation points assigned to this pool.
    uint256 public poolStartTime; // timestamp when the owner add a farm
    uint256 public globalRoundId;
    uint256 public availableRewards;
    uint256 public farmId;

    //only after this time, rewards will be fetched and ditributed to the users from last date
    uint256 public lastReserveDistributionTimestamp;
    uint256 public depositPeriod; // 24 hours;
    uint256 public constant REWARD_PRECISION = 10**12;

    uint256[] cumulativeMoneyPerShare;
    uint256[] deposits;

    // The MONEY TOKEN!
    address public money;
    // Factory address
    address public factory;

    // Info of each user that stakes LP tokens.
    mapping(address => UserInfo) public userInfo;

    event Deposit(
        address indexed user,
        uint256 roundId,
        uint256 amount,
        uint256 rewards
    );
    event Withdraw(
        address indexed user,
        uint256 roundId,
        uint256 amount,
        uint256 rewards
    );
    event PoolUpdated();

    constructor(
        address _money,
        uint256 _allocPoint,
        IERC20 _lpToken,
        uint16 _depositFeeBP,
        uint256 _globalRoundId,
        uint256 _farmId,
        uint256 _depositPeriod
    ) public {
        require(
            _money != address(0),
            "Farm:constructor:: ERR_ZERO_ADDRESS_MONEY"
        );

        money = _money;
        factory = msg.sender;
        allocPoint = _allocPoint;
        lpToken = _lpToken;
        depositFeeBP = _depositFeeBP;
        lastReserveDistributionTimestamp = depositPeriod.add(block.timestamp);
        poolStartTime = block.timestamp;
        globalRoundId = _globalRoundId;
        farmId = _farmId;

        depositPeriod = _depositPeriod;
    }

    modifier onlyFactory() {
        require(factory == msg.sender, "Farm: caller is not the factory");
        _;
    }

    // Update the given pool's MONEY allocation point and deposit fee. Can only be called by the owner.
    function set(uint256 _allocPoint, uint16 _depositFeeBP) public onlyFactory {
        allocPoint = _allocPoint;
        depositFeeBP = _depositFeeBP;
    }

    /**
        roundId:
        if (startTime - block.timestamp) < depositPeriod => 0
        else
        (startTime + depositPeriod - block.timestamp) < 30 days => 1
        else
        (startTime + depositPeriod - block.timestamp)/ 30 days => roundId

        Example:
        startTime 100
        currentTime 500
        depositPeriod 10
        reserveDistributionSchedule 50

        109 = 0  (109 - 100) = (9 < 10) hence 0
        159 = 1  (159 - 100+10) = (49 < 40) hence 1
        209 = 2  (209 - 110) = 99/50 = 1+1 = 2
        259 = 3  (259 - 110) = 149/50 = 2+1 = 3
        309 = 4  (259 - 110) = 149/50 = 2+1 = 4
     */
    function getCurrentRoundId() public view returns (uint256 depositForRound) {
        if ( deposits.length <= 0){
            return 0;
        }
        // zero indexed round ids
        uint256 timeDiff = block.timestamp.sub(poolStartTime);

        uint256 reserveDistributionSchedule = getReserveDistributionSchedule();
        if (timeDiff < depositPeriod) {
            return 0;
        } else if (timeDiff.sub(depositPeriod) < reserveDistributionSchedule) {
            depositForRound = 1;
        } else {
            depositForRound = (timeDiff.sub(depositPeriod)).div(
                reserveDistributionSchedule
            );

            depositForRound++;
        }

        if (
            depositForRound != deposits.length.sub(1) &&
            depositForRound != deposits.length
        ) {
            depositForRound = deposits.length;
        }
    }

    function getMoneyPerShare(uint256 _round) external view returns (uint256) {
        if (cumulativeMoneyPerShare.length <= _round) return 0;
        if (cumulativeMoneyPerShare.length == 1)
            return cumulativeMoneyPerShare[_round];
        return
            cumulativeMoneyPerShare[_round].sub(
                cumulativeMoneyPerShare[_round.sub(1)]
            );
    }

    function getPoolDeposits(uint256 _round) external view returns (uint256) {
        if (deposits.length <= _round) return 0;
        return deposits[_round];
    }

    function getReserveDistributionSchedule() public view returns (uint256) {
        return IFarmFactory(factory).reserveDistributionSchedule();
    }

    function _updateRewards() internal {
        if (
            lastReserveDistributionTimestamp.add(
                getReserveDistributionSchedule()
            ) <= block.timestamp
        ) {
            updatePool();
        }
    }

    function updatePool() public {
        uint256 lastPoolRoundUpdated = cumulativeMoneyPerShare.length;
        if (lastPoolRoundUpdated != 0) lastPoolRoundUpdated--;

        uint256 rewardIndex = globalRoundId.add(lastPoolRoundUpdated);
        uint256 totalRounds = IFarmFactory(factory)
            .globalRoundId()
            .sub(rewardIndex)
            .add(1);

        uint256 totalAllocPoint = IFarmFactory(factory).totalAllocPoint();

        for (uint256 round = 1; round <= totalRounds; round++) {
            uint256 reward = IFarmFactory(factory).getRewards(
                rewardIndex + round - 1
            );

            uint256 roundRewards = (reward.mul(allocPoint))
                .div(totalAllocPoint)
                .mul(REWARD_PRECISION);

            uint256 share = roundRewards.div(deposits[round - 1]);

            //to initialise 0th round
            if (cumulativeMoneyPerShare.length != 0)
                share = share.add(cumulativeMoneyPerShare[round.sub(2)]);

            cumulativeMoneyPerShare.push(share);
            availableRewards = availableRewards.add(roundRewards);
        }

        lastReserveDistributionTimestamp = block.timestamp;

        emit PoolUpdated();
    }

    function pendingMoney(address _user) public view returns (uint256 pending) {
        UserInfo memory user = userInfo[_user];
        if (user.amount == 0) return 0;

        if (cumulativeMoneyPerShare.length == 0) return 0;

        uint256 start = user.entryFarmRound;
        uint256 end = cumulativeMoneyPerShare.length - 1;

        if (end < start) return 0;

        uint256 totalRewardPerShare;

        if (start == end) {
            totalRewardPerShare = cumulativeMoneyPerShare[start];
            if (start != 0) {
                totalRewardPerShare = totalRewardPerShare.sub(
                    cumulativeMoneyPerShare[start.sub(1)]
                );
            }
        } else {
            totalRewardPerShare = cumulativeMoneyPerShare[end].sub(
                cumulativeMoneyPerShare[start]
            );
        }

        pending = user.amount.mul(totalRewardPerShare).div(REWARD_PRECISION);
    }

    // Deposit LP tokens to MoneyFarm for MONEY allocation.
    function deposit(uint256 _amount) public {
        depositFor(msg.sender, _amount);
    }

    function depositFor(address _user, uint256 _amount) public nonReentrant {
        UserInfo storage user = userInfo[_user];

        uint256 currentRound = getCurrentRoundId();
        uint256 farmAmount = _amount;

        if (farmAmount != 0) {
            lpToken.safeTransferFrom(_user, address(this), farmAmount);

            if (depositFeeBP > 0) {
                uint256 depositFee = farmAmount.mul(depositFeeBP).div(10000);
                address feeAddress = IFarmFactory(factory).feeAddress();
                lpToken.safeTransfer(feeAddress, depositFee);
                farmAmount = farmAmount.sub(depositFee);
            }

            _updateDeposits(farmAmount, currentRound);
        }

        uint256 pendingRewards = pendingMoney(_user);
        if (pendingRewards != 0) {
            availableRewards = availableRewards.sub(pendingRewards);
            IFarmFactory(factory).safeMoneyTransfer(_user, pendingRewards);
        }

        user.entryFarmRound = currentRound;
        user.amount = user.amount.add(farmAmount);

        emit Deposit(_user, currentRound, _amount, pendingRewards);
    }

    // Withdraw LP tokens from MoneyFarm.
    function withdraw(uint256 _amount) public {
        withdrawFor(msg.sender, _amount);
    }

    function withdrawFor(address _user, uint256 _amount) public nonReentrant {
        UserInfo storage user = userInfo[_user];

        require(user.amount >= _amount, "Farm:withdraw:: INVALID_AMOUNT");

        _updateRewards();

        uint256 pendingRewards = pendingMoney(_user);

        if (pendingRewards > 0) {
            availableRewards = availableRewards.sub(pendingRewards);
            IFarmFactory(factory).safeMoneyTransfer(_user, pendingRewards);
        }

        uint256 currentRound = getCurrentRoundId();

        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);

            uint256 withdrawRound = deposits.length.sub(1);

            user.entryFarmRound = currentRound;

            uint256 finalAmount = deposits[withdrawRound].sub(_amount);
            if (currentRound == withdrawRound) {
                deposits[withdrawRound] = finalAmount;
            } else {
                _updateDeposits(finalAmount, currentRound);
            }

            lpToken.safeTransfer(address(_user), _amount);
        }

        emit Withdraw(_user, currentRound, _amount, pendingRewards);
    }

    function _updateDeposits(uint256 farmAmount, uint256 currentRound)
        internal
    {
        if (deposits.length == 0) {
            deposits.push(farmAmount);
        } else if (currentRound == deposits.length) {
            deposits.push(farmAmount.add(deposits[currentRound.sub(1)]));
        } else {
            require(currentRound == deposits.length.sub(1), "ERR!");
            deposits[currentRound] = deposits[currentRound].add(farmAmount);
        }
    }
}
