const Debate = artifacts.require("Debate");
const ERC1155 = artifacts.require("ERC1155");

module.exports = function (deployer) {
  deployer.deploy(Debate);
  deployer.deploy(ERC1155);
};
