const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();

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
		const results = await db.query(
			`SELECT i.industry, c.name FROM industries AS i
				LEFT JOIN companies_industries AS ci
					ON ci.ind_code = i.code
				LEFT JOIN companies AS c
					ON ci.comp_code = c.code
				WHERE i.code=$1`,
			[code]
		);
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

// router.put("/", async (req, res, next) => {
// 	try {
// 		const { name, description } = req.body;
// 		const code = slugify(name, {
// 			replacement: "-",
// 			lower: true,
// 		});
// 		const results = await db.query(
// 			`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
// 			[name, description, code]
// 		);
// 		console.log(results.rows[0]);
// 		if (results.rows.length === 0) {
// 			throw new ExpressError(`Can't find company with code ${code}`, 404);
// 		}
// 		return res.json({ company: results.rows[0] });
// 	} catch (e) {
// 		next(e);
// 	}
// });

// router.delete("/:code", async (req, res, next) => {
// 	try {
// 		const { code } = req.params;
// 		const results = await db.query(
// 			`DELETE FROM companies WHERE code=$1 RETURNING code, name, description`,
// 			[code]
// 		);
// 		if (results.rows.length === 0) {
// 			throw new ExpressError(`Can't find company with code ${code}`, 404);
// 		}
// 		return res.json({ status: "deleted" });
// 	} catch (e) {
// 		next(e);
// 	}
// });

module.exports = router;
