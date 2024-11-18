const { describe, test } = require("node:test");
const { deepStrictEqual } = require("assert");

const request = require("supertest");
const app = require("../../app");

describe("Test GET /launches", () => {
  test("It should respond with 200 success", async () => {
    const response = await request(app)
      .get("/launches")
      .expect("Content-Type", /json/)
      .expect(200);
  });
});

describe("Test POST /launch", () => {
  const completeLaunchData = {
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    launchDate: "December 27, 2030",
    target: "Kepler-442 b",
    customer: ["ZTM", "NASA"],
  };

  const launchDataWithoutDate = {
    mission: "Kepler Exploration X",
    rocket: "Explorer IS1",
    target: "Kepler-442 b",
    customer: ["ZTM", "NASA"],
  };

  test("It should respond with 201 created", async () => {
    const response = await request(app)
      .post("/launches")
      .send(completeLaunchData)
      .expect("Content-Type", /json/)
      .expect(201);

    const requestDate = new Date(completeLaunchData.launchDate).valueOf();
    const responseDate = new Date(response.body.launchDate).valueOf();
    deepStrictEqual(responseDate, requestDate);

    const { mission, rocket, target, customer } = response.body;
    deepStrictEqual(
      {
        mission,
        rocket,
        target,
        customer,
      },
      launchDataWithoutDate
    );
  });

  test("It should catch missing required properties", async () => {
    const response = await request(app)
      .post("/launches")
      .send(launchDataWithoutDate)
      .expect("Content-Type", /json/)
      .expect(400);

    deepStrictEqual(response.body, {
      error: "Missing required launch property",
    });
  });

  test("It should catch invalid dates", async () => {
    const response = await request(app)
      .post("/launches")
      .send({
        ...launchDataWithoutDate,
        launchDate: "not a date",
      })
      .expect("Content-Type", /json/)
      .expect(400);

    deepStrictEqual(response.body, {
      error: "Invalid launch date",
    });
  });
});
