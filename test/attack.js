const { expect } = require('chai');
const { BigNumber } = require('ethers');
const { ethers, waffle } = require('hardhat');

describe('Attack', function () {
	it('After being declared the winner, Attack.sol should not allow anyone else to win', async function () {
		// Deploy contracts
		const goodContract = await ethers.getContractFactory('Good');
		const good = await goodContract.deploy();
		await good.deployed();
		console.log("Good contract's address:", good.address);

		const attackContract = await ethers.getContractFactory('Attack');
		const attack = await attackContract.deploy(good.address);
		await attack.deployed();
		console.log("Attack contract's address:", attack.address);

		const [_, addr1, addr2] = await ethers.getSigners();

		// Initially set addr1 as current winner of auction
		let tx = await good.connect(addr1).setCurrentAuctionPrice({
			value: ethers.utils.parseEther('1'),
		});
		await tx.wait();

		// Start attack & make `Attack` current winner of auction
		tx = await attack.attack({
			value: ethers.utils.parseEther('3'),
		});
		await tx.wait();

		// Now try to make addr2 the current winner of auction
		tx = await good.connect(addr2).setCurrentAuctionPrice({
			value: ethers.utils.parseEther('4'),
		});
		await tx.wait();

		// Check & see if current winner is still `Attack` contract
		expect(await good.currentWinner()).to.equal(attack.address);
	});
});
