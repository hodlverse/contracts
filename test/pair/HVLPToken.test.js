const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const loadFixture = require("./fixtures");
const { expandToNDecimals } = require("../utilities/index");
const { signERC2612Permit } = require("eth-permit");

describe("HVLPToken", function () {

    before(async function () {
        this.signers = await ethers.getSigners();
        this.alice = this.signers[0];
        this.bob = this.signers[1];
        this.carol = this.signers[2];
        this.dev = this.signers[3];
        this.minter = this.signers[4];
        this.owner = this.signers[5];
        this.router = this.signers[6];
    });
    beforeEach(async function () {
        const {
            pair,
            router
        } = await loadFixture();

        this.router = router;
        this.pair = pair
    });
    it ('Permit', async function () {

        const provider = waffle.provider;
        const value = expandToNDecimals(1).toString()

        const result = await signERC2612Permit(
            provider,
            this.pair.address,
            this.alice.address,
            this.router.address,
            value
        );



        await this.pair.permit(this.alice.address, this.router.address, value, result.deadline, result.v,
            result.r,
            result.s)

        const newAllowance = await this.pair.allowance(this.alice.address, this.router.address)
        expect(newAllowance.toString()).to.equal(value);
    });
})
