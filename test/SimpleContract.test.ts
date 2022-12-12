import { ethers, network } from "hardhat";
import { expect } from "chai";
import { Contract, ContractFactory } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

async function setUpFixture(func: any) {
  if (network.name === "hardhat") {
    return loadFixture(func);
  } else {
    return func();
  }
}

enum SpecialValues {
  RevertWithMessage = 0,
  RevertWithErrorNoParameters = 1,
  RevertWithErrorOneParameter = 2,
  RevertWithErrorTwoParameters = 3,
  PanicThroughAssert = 4,
  PanicThroughOverflow = 5,
  Allowed = 6
}

describe("Contract 'SimpleContract'", async () => {
  const EVENT_NAME_SET_VALUE = "SetValue";

  const REVERT_MESSAGE_IF_NEW_VALUE_IS_PROHIBITED = "The new value is prohibited: 'SpecialValues.RevertWithMessage'";

  const REVERT_ERROR_BAD_VALUE_NO_PARAMETERS = "BadValueNoParameters";
  const REVERT_ERROR_BAD_VALUE_ONE_PARAMETER = "BadValueOneParameter";
  const REVERT_ERROR_BAD_VALUE_TWO_PARAMETERS = "BadValueTwoParameters";

  let simpleContractFactory: ContractFactory;

  before(async () => {
    simpleContractFactory = await ethers.getContractFactory("SimpleContract");
  });

  async function deployContract(): Promise<{ simpleContract: Contract }> {
    const simpleContract: Contract = await simpleContractFactory.deploy();
    await simpleContract.deployed();
    return { simpleContract };
  }

  describe("Function 'setValueUint256()'", async () => {
    it("Executes as expected and emits the correct event if the value is allowed", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      const value = 123;

      await expect(
        simpleContract.setValueUint256(value)
      ).to.emit(
        simpleContract,
        EVENT_NAME_SET_VALUE
      ).withArgs(0, value);
      expect(await simpleContract.value()).to.equal(value);
    });

    it("Is reverted with the message if it is called with the value equals 0", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.RevertWithMessage)
      ).to.be.revertedWith(REVERT_MESSAGE_IF_NEW_VALUE_IS_PROHIBITED);
    });

    it("Is reverted with the expected error if it is called with the value equals 1", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.RevertWithErrorNoParameters)
      ).to.be.revertedWithCustomError(simpleContract, REVERT_ERROR_BAD_VALUE_NO_PARAMETERS);
    });

    it("Is reverted with the expected error if it is called with the value equals 2", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.RevertWithErrorOneParameter)
      ).to.be.revertedWithCustomError(
        simpleContract, REVERT_ERROR_BAD_VALUE_ONE_PARAMETER
      ).withArgs(simpleContract.signer.address);
    });

    it("Is reverted with the expected error if it is called with the value equals 3", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.RevertWithErrorTwoParameters)
      ).to.be.revertedWithCustomError(
        simpleContract, REVERT_ERROR_BAD_VALUE_TWO_PARAMETERS
      ).withArgs(
        simpleContract.signer.address,
        0
      );
    });

    it("Is reverted with the expected panic code if it is called with the value equals 4", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.PanicThroughAssert)
      ).to.be.revertedWithPanic("0x01");
    });

    it("Is reverted with the expected panic code if it is called with the value equals 5", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      await expect(
        simpleContract.setValueUint256(SpecialValues.PanicThroughOverflow)
      ).to.be.revertedWithPanic("0x11");
    });
  });

  describe("Function 'setValueWithEnum()'", async () => {
    it("Executes as expected and emits the correct event if the value is allowed", async () => {
      const { simpleContract } = await setUpFixture(deployContract);
      const value = SpecialValues.Allowed;

      await expect(
        simpleContract.setValueWithEnum(value)
      ).to.emit(
        simpleContract,
        EVENT_NAME_SET_VALUE
      ).withArgs(0, value);
      expect(await simpleContract.value()).to.equal(value);
    });
  });
});
