// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // ABI
        // contract 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //   ETH in terms of USD
        // 3000.0000000
        return uint256(price * 1e18); //1**18 == 10000000000000
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        // 3000.0000000000000 = eth /usd price

        uint256 ethAmountInUsdt = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsdt;
    }
}
