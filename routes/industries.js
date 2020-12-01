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

// router.get("/:code", async (req, res, next) => {
// 	try {
// 		const { code } = req.params;
// 		const results = await db.query(
// 			`SELECT c.name, c.description, i.industry FROM companies AS c
// 				LEFT JOIN companies_industries AS ci
// 					ON ci.comp_code = c.code
// 				LEFT JOIN industries AS i
// 					ON ci.ind_code = i.code
// 				WHERE c.code=$1`,
// 			[code]
// 		);
// 		if (results.rows.length === 0) {
// 			throw new ExpressError(`Can't find company with code ${code}`, 404);
// 		}
// 		const { name, description } = results.rows[0];
// 		const company = { code, name, description };
// 		company.industries = results.rows.map((r) => r.industry);
// 		return res.json({ company: company });
// 	} catch (e) {
// 		next(e);
// 	}
// });

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
