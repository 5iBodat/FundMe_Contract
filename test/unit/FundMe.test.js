const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    let sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
        // deploy our fundme contract
        // using Hardjat-deploy
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer)
    })

    describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async function () {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })


    describe("fund", async () => {
        it("Fails if you don't send enaugh ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith("Didn't send enaugh")
        })

        it("Update the amount funded data structure", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmount(deployer)
            assert(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({
                value: sendValue
            })
        })

        it("withdraw ETH from a single founder", async function () {
            const startingfundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //  Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingfundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingfundMeBalance, 0);
            assert.equal(startingfundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());
        })

        it("Allows us with multiple funders", async () => {
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                const fundMeConnectContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectContract.fund({ value: sendValue })
            }

            const startingfundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            //  Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingfundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // assert
            assert.equal(endingfundMeBalance, 0);
            assert.equal(startingfundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString());

            // make sure that the funders are reset properly

            await expect(fundMe.getFunders(0)).to.be.reverted

            for (let i = 1; i < 6; i++) {
                assert.equal(await fundMe.addressToAmountFunded(accounts[i].address), 0)
            }

        })

        it("Only allows the owners to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attakers = accounts[1]
            const attakerConnectContract = await fundMe.connect(attakers)
            await expect(attakerConnectContract.withdraw()).to.be.reverted
        })
    })
})