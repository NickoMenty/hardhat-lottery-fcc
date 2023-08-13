const { network, ether, deployments, getNamedAccounts } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle units tests", async function () {
          const chainId = network.config.chainId
          let raffle, vrfCoordinatorV2Mock, raffleEnterenceFee, deployer
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              player = (await getNamedAccounts()).player
              await deployments.fixture(["all"])
              raffle = await ethers.getContractAt("Raffle", deployer)
              vrfCoordinatorV2Mock = await ethers.getContractAt("VRFCoordinatorV2Mock", deployer)
              raffleEnterenceFee = await raffle.getEnteranceFee()
          })
          describe("constructor", async function () {
              it("initializes the raffle correctly", async function () {
                  const raflestate = await raffle.getRaffleState()
                  const interval = await raffle.getInterval()
                  assert.equal(raflestate.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
              })
          })
          describe("EnterRaffle", async function () {
              it("Reverts when you don't send enough", async function () {
                  await expect(raffle.enterRaffle()).to.be.revertedWith("Raffle_NotEnoughETH")
              })
              it("Records players when they enter", async function () {
                  await raffle.enterRaffle({ value: raffleEnterenceFee })
                  const playerFromContract = await raffle.getPlayer(0)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event on enter", async function () {
                  await expect(
                      raffle.enterRaffle({
                          value: raffleEnterenceFee,
                      }),
                  ).to.emit(raffle, "RaffleEnter")
              })
          })
      })
