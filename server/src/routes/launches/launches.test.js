const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /launches", () => {
    it("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
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

    it("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-Type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toStrictEqual(requestDate);

      const { mission, rocket, target, customer } = response.body;
      expect({
        mission,
        rocket,
        target,
        customer,
      }).toStrictEqual(launchDataWithoutDate);
    });

    it("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchDataWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    it("It should catch invalid dates", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({
          ...launchDataWithoutDate,
          launchDate: "not a date",
        })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
