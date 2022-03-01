// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract IDO is Ownable, Pausable, BaseRelayRecipient {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    // IDO Configs
    uint256 public saleStartTime;
    uint256 public saleEndTime;
    uint256 public unlockTime;
    uint256 public saleCap;
    uint256 public exchangeRate;

    uint256 public depositMin;
    uint256 public depositMax;

    uint256 public totalUSDTBalance;
    uint256 public totalMoneyClaimed;

    address public withdrawer;

    IERC20 public USDT;
    IERC20 public MONEY;
    uint256 public constant EXCHANGE_RATE_PRECISION = 10**12;
    uint256 public constant MONEY_DECIMALS = 10**18;
    uint256 public constant USDT_DECIMALS = 10**6;

    mapping(address => uint256) public balanceOf;

    event Deposited(address indexed account, uint256 amount);
    event Claimed(address indexed account, uint256 amount);
    event EmergencyWithdrawals(
        address indexed account,
        address indexed token,
        uint256 amount
    );

    event UpdateSaleStartTime(uint256 newSaleStartTime);
    event UpdateSaleEndTime(uint256 newSaleEndTime);
    event UpdateUnlockTime(uint256 newUnlockTime);
    event UpdateWithdrawer(address newWithdrawer);
    event UpdateDepositMin(uint256 newDepositMin);
    event UpdateDepositMax(uint256 newDepositMax);
    event Withdraw(uint256 usdtBalance);

    constructor(
        uint256 _saleStartTime,
        uint256 _saleEndTime,
        uint256 _unlockTime,
        uint256 _saleCap,
        uint256 _depositMin,
        uint256 _depositMax,
        uint256 _exchangeRate,
        address usdtAddr,
        address moneyAddr,
        address _trustedForwarder
    ) public {
        require(_exchangeRate != 0, "MoneyIDO: exchange rate cannot be zero");

        saleStartTime = _saleStartTime;
        saleEndTime = _saleEndTime;
        unlockTime = _unlockTime;
        saleCap = _saleCap;
        depositMin = _depositMin;
        depositMax = _depositMax;
        exchangeRate = _exchangeRate;

        USDT = IERC20(usdtAddr);
        MONEY = IERC20(moneyAddr);

        trustedForwarder = _trustedForwarder;
    }

    function setSaleStartTime(uint256 newSaleStartTime) external onlyOwner {
        require(
            newSaleStartTime < saleEndTime,
            "MoneyIDO: Invalid sale start time."
        );
        saleStartTime = newSaleStartTime;

        emit UpdateSaleStartTime(newSaleStartTime);
    }

    function setSaleEndTime(uint256 newSaleEndTime) external onlyOwner {
        require(
            newSaleEndTime > saleStartTime && unlockTime > newSaleEndTime,
            "MoneyIDO: Invalid sale end time"
        );
        saleEndTime = newSaleEndTime;

        emit UpdateSaleEndTime(newSaleEndTime);
    }

    function setWithdrawer(address newWithdrawer) external onlyOwner {
        require(
            newWithdrawer != address(0),
            "MoneyIDO: Invalid withdrawer address."
        );
        withdrawer = newWithdrawer;

        emit UpdateWithdrawer(newWithdrawer);
    }

    function setUnlockTime(uint256 newUnlockTime) external onlyOwner {
        require(newUnlockTime > saleEndTime, "MoneyIDO: Invalid unlock time");
        unlockTime = newUnlockTime;

        emit UpdateUnlockTime(newUnlockTime);
    }

    function setDepositMin(uint256 newDepositMin) external onlyOwner {
        require(newDepositMin != uint256(-1), "MoneyIDO: Invalid min deposit.");
        depositMin = newDepositMin;

        emit UpdateDepositMin(newDepositMin);
    }

    function setDepositMax(uint256 newDepositMax) external onlyOwner {
        require(newDepositMax != 0, "MoneyIDO: Invalid max deposit");
        depositMax = newDepositMax;

        emit UpdateDepositMax(newDepositMax);
    }

    function pause() external onlyOwner whenNotPaused {
        require(
            block.timestamp < unlockTime,
            "MoneyIDO: cannot be paused after unock time"
        );
        _pause();
    }

    function _getMoneyForUSDT(uint256 _usdt)
        internal
        view
        returns (uint256 _money)
    {
        _money = _usdt
            .mul(MONEY_DECIMALS)
            .mul(exchangeRate)
            .div(USDT_DECIMALS)
            .div(EXCHANGE_RATE_PRECISION);
    }

    function deposit(uint256 amount) external whenNotPaused {
        require(
            block.timestamp >= saleStartTime,
            "MoneyIDO: IDO is not started yet."
        );
        require(
            block.timestamp <= saleEndTime,
            "MoneyIDO: IDO is already finished."
        );
        require(
            MONEY.balanceOf(address(this)) >= _getMoneyForUSDT(saleCap),
            "MoneyIDO: MONEY balance not enough"
        );

        uint256 finalAmount = balanceOf[_msgSender()].add(amount);
        require(
            finalAmount >= depositMin,
            "MoneyIDO: Does not meet minimum deposit requirements."
        );
        require(
            finalAmount <= depositMax,
            "MoneyIDO: Does not meet maximum deposit requirements."
        );
        require(
            totalUSDTBalance.add(amount) <= saleCap,
            "MoneyIDO: Sale Cap overflow."
        );

        balanceOf[_msgSender()] = finalAmount;
        totalUSDTBalance = totalUSDTBalance.add(amount);

        USDT.safeTransferFrom(_msgSender(), address(this), amount);
        emit Deposited(_msgSender(), amount);
    }

    function claim() external whenNotPaused {
        require(
            block.timestamp >= unlockTime,
            "MoneyIDO: IDO is not unlocked yet."
        );
        require(balanceOf[_msgSender()] > 0, "MoneyIDO: Insufficient balance.");

        uint256 moneyAmount = _getMoneyForUSDT(balanceOf[_msgSender()]);

        balanceOf[_msgSender()] = 0;
        totalMoneyClaimed = totalMoneyClaimed.add(moneyAmount);

        MONEY.safeTransfer(_msgSender(), moneyAmount);
        emit Claimed(_msgSender(), moneyAmount);
    }

    function withdraw() external whenNotPaused {
        require(
            _msgSender() == withdrawer,
            "MoneyIDO: You can't withdraw funds."
        );
        require(
            block.timestamp >= unlockTime,
            "MoneyIDO: IDO is not unlocked yet."
        );

        uint256 usdtBalance = USDT.balanceOf(address(this));
        USDT.safeTransfer(withdrawer, usdtBalance);

        emit Withdraw(usdtBalance);
    }

    function withdrawRest() external whenNotPaused {
        require(
            _msgSender() == withdrawer,
            "MoneyIDO: You can't withdraw funds."
        );
        require(
            block.timestamp >= unlockTime,
            "MoneyIDO: IDO is not unlocked yet."
        );

        uint256 soldMoneyAmount = _getMoneyForUSDT(totalUSDTBalance);
        uint256 unsoldMoneyBalance = MONEY.balanceOf(address(this)).sub(
            soldMoneyAmount
        );
        MONEY.safeTransfer(withdrawer, unsoldMoneyBalance);

        emit Withdraw(unsoldMoneyBalance);
    }

    // In case the contract is paused due to some reason, the users and withdrawer will still
    // be able to pull out the investments through this function
    function emergencyWithdraw() external whenPaused {
        uint256 withdrawAmount;
        address token;
        if (_msgSender() == withdrawer) {
            withdrawAmount = MONEY.balanceOf(address(this));
            require(
                withdrawAmount > 0,
                "MoneyIDO:emergencyWithdraw:: Insufficient MONEY balance."
            );

            token = address(MONEY);
            MONEY.safeTransfer(_msgSender(), withdrawAmount);
        } else {
            require(
                balanceOf[_msgSender()] > 0,
                "MoneyIDO:emergencyWithdraw:: Insufficient USDT balance."
            );

            token = address(USDT);
            withdrawAmount = balanceOf[_msgSender()];

            balanceOf[_msgSender()] = 0;
            USDT.safeTransfer(_msgSender(), withdrawAmount);
        }
        emit EmergencyWithdrawals(_msgSender(), token, withdrawAmount);
    }

    /**
     * OPTIONAL
     * You should add one setTrustedForwarder(address _trustedForwarder)
     * method with onlyOwner modifier so you can change the trusted
     * forwarder address to switch to some other meta transaction protocol
     * if any better protocol comes tomorrow or current one is upgraded.
     */

    /**
     * Override this function.
     * This version is to keep track of BaseRelayRecipient you are using
     * in your contract.
     */
    function versionRecipient() external view override returns (string memory) {
        return "1";
    }

    function _msgSender()
        internal
        view
        override(BaseRelayRecipient, Context)
        returns (address payable ret)
    {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(BaseRelayRecipient, Context)
        returns (bytes memory ret)
    {
        return super._msgData();
    }
}
