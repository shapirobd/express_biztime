const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();

async function getCompanyFromCode(code) {
	const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
		code,
	]);
	if (results.rows.length === 0) {
		throw new ExpressError(`Can't find company with code {code}`, 404);
	}
	return results.rows[0];
}

router.get("/", async (req, res, next) => {
	try {
		const results = await db.query(`SELECT * FROM invoices`);
		return res.json({ invoices: results.rows });
	} catch (e) {
		next(e);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id ${id}`, 404);
		}
		const comp_code = results.rows[0].comp_code;
		const company = await getCompanyFromCode(comp_code);

		delete results.rows[0].comp_code;
		results.rows[0]["company"] = company;
		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		next(e);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		next(e);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt } = req.body;
		const results = await db.query(
			`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, id]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id ${id}`, 404);
		}
		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		next(e);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const results = await db.query(
			`DELETE FROM invoices WHERE id=$1 RETURNING comp_code, amt`,
			[id]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id ${id}`, 404);
		}
		return res.json({ status: "deleted" });
	} catch (e) {
		next(e);
	}
});

module.exports = router;
