const db = require("../db");

function getIndustryQuery(code) {
	return db.query(
		`SELECT i.industry, c.name FROM industries AS i
				LEFT JOIN companies_industries AS ci
					ON ci.ind_code = i.code
				LEFT JOIN companies AS c
					ON ci.comp_code = c.code
				WHERE i.code=$1`,
		[code]
	);
}

function getCompanyQuery(code) {
	return db.query(
		`SELECT c.name, c.description, i.industry FROM companies AS c
				LEFT JOIN companies_industries AS ci
					ON ci.comp_code = c.code
				LEFT JOIN industries AS i
					ON ci.ind_code = i.code
				WHERE c.code=$1`,
		[code]
	);
}

function updateCompanyQuery(name, description, code) {
	return db.query(
		`UPDATE companies 
			SET name=$1, description=$2 WHERE code=$3 
			RETURNING code, name, description`,
		[name, description, code]
	);
}

async function getCompanyFromCode(code) {
	const results = await db.query(`SELECT * FROM companies WHERE code=$1`, [
		code,
	]);
	if (results.rows.length === 0) {
		throw new ExpressError(`Can't find company with code {code}`, 404);
	}
	return results.rows[0];
}

function determinePaidDate(paid, invoice) {
	if (paid === true && invoice.paid == false) {
		return new Date().toISOString();
	} else if (paid === false && invoice.paid === true) {
		return null;
	} else if (invoice.paid === true) {
		return invoice.paid_date;
	}
}

module.exports = {
	getIndustryQuery,
	getCompanyQuery,
	updateCompanyQuery,
	getCompanyFromCode,
	determinePaidDate,
};
