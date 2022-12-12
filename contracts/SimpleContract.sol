// SPDX-License-Identifier: MIT

pragma solidity 0.8.16;

contract SimpleContract {
    uint256 public value;

    enum SpecialValues {
        RevertWithMessage,            //0
        RevertWithErrorNoParameters,  //1
        RevertWithErrorOneParameter,  //2
        RevertWithErrorTwoParameters, //3
        PanicThroughAssert,           //4
        PanicThroughOverflow,         //5
        Allowed                       //6
    }

    event SetValue(uint256 oldValue, uint256 newValue);

    error BadValueNoParameters();
    error BadValueOneParameter(address sender);
    error BadValueTwoParameters(address sender, uint256 oldValue);

    function setValueUint256(uint256 newValue) external returns (uint256 oldValue) {
        oldValue = _setValue(newValue);
    }

    function setValueWithEnum(SpecialValues newValue) external returns (uint256 oldValue) {
        oldValue = _setValue(uint256(newValue));
    }

    function _setValue(uint256 newValue) internal returns (uint256 oldValue) {
        if (newValue == uint256(SpecialValues.RevertWithMessage)) {
            revert("The new value is prohibited: 'SpecialValues.RevertWithMessage'");
        } else if (newValue == uint256(SpecialValues.RevertWithErrorNoParameters)) {
            revert BadValueNoParameters();
        } else if (newValue == uint256(SpecialValues.RevertWithErrorOneParameter)) {
            revert BadValueOneParameter(msg.sender);
        } else if (newValue == uint256(SpecialValues.RevertWithErrorTwoParameters)) {
            revert BadValueTwoParameters(msg.sender, value);
        } else if (newValue == uint256(SpecialValues.PanicThroughAssert)) {
            assert(false);
        } else if (newValue == uint256(SpecialValues.PanicThroughOverflow)) {
            newValue += type(uint256).max;
        }

        oldValue = value;
        value = newValue;

        emit SetValue(oldValue, newValue);
    }
}
