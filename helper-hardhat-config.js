const networkConfig = {
    5: {
        name: "rinkeby",
        ethUsdPriceFeed: "0xAc559F25B1619171CbC396a50854A3240b6A4e99",
    },
    137: {
        name: "polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    }
}

const developmentChain = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentChain,
    DECIMALS,
    INITIAL_ANSWER
}