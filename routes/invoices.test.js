// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;
let testCompany;
beforeEach(async () => {
	const compResult = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('goog', 'Google', 'The number 1 web browser.') RETURNING code, name, description`
	);
	testCompany = compResult.rows[0];
	const invResult = await db.query(
		`INSERT INTO invoices (comp_code, amt) VALUES ('goog', 500) RETURNING id, comp_code, amt, paid, add_date, paid_date`
	);
	testInvoice = invResult.rows[0];
});

afterEach(async () => {
	await db.query("DELETE FROM companies");
	await db.query("DELETE FROM invoices");
});

afterAll(async () => {
	await db.end();
});

describe("GET /invoices", () => {
	test("All invoices returned", async () => {
		const resp = await request(app).get("/invoices");
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			invoices: [
				{
					id: testInvoice.id,
					comp_code: testInvoice.comp_code,
					amt: testInvoice.amt,
					paid: testInvoice.paid,
					add_date: testInvoice.add_date.toISOString(),
					paid_date: testInvoice.paid_date,
				},
			],
		});
	});
});

describe("GET /invoices/:id", () => {
	test("Correct invoice returned", async () => {
		const resp = await request(app).get(`/invoices/${testInvoice.id}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			invoice: {
				id: testInvoice.id,
				company: {
					code: testInvoice.comp_code,
					description: testCompany.description,
					name: testCompany.name,
				},
				amt: testInvoice.amt,
				paid: testInvoice.paid,
				add_date: testInvoice.add_date.toISOString(),
				paid_date: testInvoice.paid_date,
			},
		});
	});
	test("404 if invoice id not found", async () => {
		const resp = await request(app).get(`/invoices/3200`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find invoice with id 3200",
		});
	});
});

describe("POST /invoices", () => {
	test("Invoice created", async () => {
		const resp = await request(app).post("/invoices").send({
			comp_code: "goog",
			amt: 200,
		});
		const invoiceRes = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
			resp.body.invoice.id,
		]);
		const invoice = invoiceRes.rows[0];
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({
			invoice: {
				id: invoice.id,
				comp_code: invoice.comp_code,
				amt: invoice.amt,
				paid: invoice.paid,
				add_date: invoice.add_date.toISOString(),
				paid_date: invoice.paid_date,
			},
		});
	});
});

describe("PUT /invoices/:id", () => {
	test("Invoice updated", async () => {
		const resp = await request(app).put(`/invoices/${testInvoice.id}`).send({
			amt: 9999,
		});
		expect(resp.statusCode).toBe(200);
		testInvoiceResult = await db.query(`SELECT * FROM invoices WHERE id=$1`, [
			testInvoice.id,
		]);
		testInvoice = testInvoiceResult.rows[0];
		expect(resp.body).toEqual({
			invoice: {
				id: testInvoice.id,
				comp_code: testInvoice.comp_code,
				amt: testInvoice.amt,
				paid: testInvoice.paid,
				add_date: testInvoice.add_date.toISOString(),
				paid_date: testInvoice.paid_date,
			},
		});
	});
	test("404 if invoice id not found", async () => {
		const resp = await request(app).put(`/invoices/369`).send({
			name: "Nike",
			description: "Awesome shoes",
		});
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find invoice with id 369",
		});
	});
});

// describe("DELETE /companies/:code", () => {
// 	test("Company deleted", async () => {
// 		const resp = await request(app).delete(`/companies/${testCompany.code}`);
// 		expect(resp.statusCode).toBe(200);
// 		expect(resp.body).toEqual({
// 			status: "deleted",
// 		});
// 	});
// 	test("404 if company code not found", async () => {
// 		const resp = await request(app).delete(`/companies/999`);
// 		expect(resp.statusCode).toBe(404);
// 		expect(resp.body).toEqual({
// 			error: "Can't find company with code 999",
// 		});
// 	});
// });
