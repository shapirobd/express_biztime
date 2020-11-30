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

describe("GET /companies/:code", () => {
	test("Correct company returned", async () => {
		const resp = await request(app).get(`/companies/${testCompany.code}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			company: {
				code: testCompany.code,
				name: testCompany.name,
				description: testCompany.description,
			},
		});
	});
	test("404 if company code not found", async () => {
		const resp = await request(app).get(`/companies/123`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find company with code 123",
		});
	});
});

describe("POST /companies", () => {
	test("Company created", async () => {
		const body = {
			code: "amzn",
			name: "Amazon",
			description: "Great for shopping",
		};
		const resp = await request(app).post("/companies").send(body);
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({
			company: body,
		});
	});
});

describe("PUT /companies/:code", () => {
	test("Company updated", async () => {
		const resp = await request(app).put(`/companies/${testCompany.code}`).send({
			name: "Nike",
			description: "Awesome shoes",
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			company: {
				code: "goog",
				name: "Nike",
				description: "Awesome shoes",
			},
		});
	});
	test("404 if company code not found", async () => {
		const resp = await request(app).put(`/companies/999`).send({
			name: "Nike",
			description: "Awesome shoes",
		});
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find company with code 999",
		});
	});
});

describe("DELETE /companies/:code", () => {
	test("Company deleted", async () => {
		const resp = await request(app).delete(`/companies/${testCompany.code}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			status: "deleted",
		});
	});
	test("404 if company code not found", async () => {
		const resp = await request(app).delete(`/companies/999`);
		expect(resp.statusCode).toBe(404);
		expect(resp.body).toEqual({
			error: "Can't find company with code 999",
		});
	});
});
