const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();
const { getIndustryQuery } = require("./helpers.js");

router.get("/", async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM industries`);
		return res.json({ industries: results.rows });
	} catch (e) {
		next(e);
	}
});

router.get("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await getIndustryQuery(code);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find industry with code ${code}`, 404);
		}
		const { name, industry } = results.rows[0];
		const ind = { code, industry };
		ind.companies = results.rows.map((r) => r.name);
		return res.json({ industry: ind });
	} catch (e) {
		next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const results = await db.query(
			`INSERT INTO industries (code, industry) VALUES ($1, $2)`,
			[code, industry]
		);
		return res.status(201).json({ company: { code, industry } });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
