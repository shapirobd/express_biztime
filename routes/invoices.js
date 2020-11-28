const ExpressError = require("../expressError");
const express = require("express");
const db = require("../db");
const router = express.Router();

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
		const invoiceResults = await db.query(
			`SELECT * FROM invoices WHERE id=$1`,
			[id]
		);
		if (invoiceResults.rows.length === 0) {
			throw new ExpressError(`Can't find invoice with id ${id}`, 404);
		}
		const companyResults = await db.query(
			`SELECT * FROM companies WHERE code=$1`,
			[invoiceResults.rows[0].comp_code]
		);
		delete invoiceResults.rows[0].comp_code;
		invoiceResults.rows[0]["company"] = companyResults.rows[0];
		return res.json({ invoice: invoiceResults.rows[0] });
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

router.put("/:code", async (req, res, next) => {
	try {
		const { code } = req.params;
		const { name, description } = req.body;
		const results = await db.query(
			`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
			[name, description, code]
		);
		console.log(results);
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
