const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();
const slugify = require("slugify");
const { updateCompanyQuery, getCompanyQuery } = require("./helpers");

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
		const results = await getCompanyQuery(code);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code ${code}`, 404);
		}
		const { name, description } = results.rows[0];
		const company = { code, name, description };
		company.industries = results.rows.map((r) => r.industry);
		return res.json({ company: company });
	} catch (e) {
		next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { code, name, description } = req.body;
		const results = await db.query(
			`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)`,
			[code, name, description]
		);
		return res.status(201).json({ company: { code, name, description } });
	} catch (e) {
		next(e);
	}
});

router.put("/", async (req, res, next) => {
	try {
		const { name, description } = req.body;
		const code = slugify(name, {
			replacement: "-",
			lower: true,
		});
		const results = await updateCompanyQuery(name, description, code);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code ${code}`, 404);
		}
		return res.json({ company: results.rows[0] });
	} catch (e) {
		next(e);
	}
});

router.delete("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const results = await db.query(
			`DELETE FROM companies WHERE code=$1 RETURNING code, name, description`,
			[code]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find company with code ${code}`, 404);
		}
		return res.json({ status: "deleted" });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
