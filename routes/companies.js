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

module.exports = router;
