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
		console.log(resp.body);
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
		const resp = await request(app).get(`/invoices/32`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find invoice with id 32",
		});
	});
});

// describe("POST /companies", () => {
// 	test("Company created", async () => {
// 		const body = {
// 			code: "amzn",
// 			name: "Amazon",
// 			description: "Great for shopping",
// 		};
// 		const resp = await request(app).post("/companies").send(body);
// 		expect(resp.statusCode).toBe(201);
// 		expect(resp.body).toEqual({
// 			company: body,
// 		});
// 	});
// });

// describe("PUT /companies/:code", () => {
// 	test("Company updated", async () => {
// 		const resp = await request(app).put(`/companies/${testCompany.code}`).send({
// 			name: "Nike",
// 			description: "Awesome shoes",
// 		});
// 		expect(resp.statusCode).toBe(200);
// 		expect(resp.body).toEqual({
// 			company: {
// 				code: "goog",
// 				name: "Nike",
// 				description: "Awesome shoes",
// 			},
// 		});
// 	});
// 	test("404 if company code not found", async () => {
// 		const resp = await request(app).put(`/companies/999`).send({
// 			name: "Nike",
// 			description: "Awesome shoes",
// 		});
// 		expect(resp.statusCode).toBe(404);
// 		expect(resp.body).toEqual({
// 			error: "Can't find company with code 999",
// 		});
// 	});
// });

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
