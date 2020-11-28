const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM companies`);
		return res.json({ companies: results.rows });
	} catch (e) {
		next(e);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
			code,
		]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code ${code}`, 404);
		}
		return res.json({ company: results.rows[0] });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
