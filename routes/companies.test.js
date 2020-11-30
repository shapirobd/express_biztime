// Tell Node that we're in test "mode"
process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
	const result = await db.query(
		`INSERT INTO companies (code, name, description) VALUES ('goog', 'Google', 'The number 1 web browser.') RETURNING code, name, description`
	);
	testCompany = result.rows[0];
});

afterEach(async () => {
	await db.query("DELETE FROM companies");
});

afterAll(async () => {
	await db.end();
});

describe("GET /companies", () => {
	test("All companies returned", async () => {
		const resp = await request(app).get("/companies");
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			companies: [
				{
					code: testCompany.code,
					name: testCompany.name,
					description: testCompany.description,
				},
			],
		});
	});
});

// describe('GET /companies/:code') {
//     test() {
//         expect()
//     }
// }

// describe('POST /companies') {
//     test() {
//         expect()
//     }
// }

// describe('PUT /companies/:code') {
//     test() {
//         expect()
//     }
// }

// describe('DELETE /companies/:code') {
//     test() {
//         expect()
//     }
// }
