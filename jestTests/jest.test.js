const request = require("supertest");
const app = require("../src/app");
const { registerBootstrapAdmin } = require("../database");

require("dotenv").config();

describe("Create teacher", () => {
  it("should create a teacher", async () => {
    const userData = {
      user_name: "testTeacherUser",
      user_email: "testTeacherFiap@email.com.br",
      user_pass: "12345678",
      role: "readWrite",
    };
    const response = await request(app).post("/users/register").send(userData);
    expect(response.statusCode).toBe(201);
  });
});

describe("Teacher CRUD", () => {
  const agent = request.agent(app);
  let postId;
  beforeAll(async () => {
    await agent.post("/users/login").send({
      user_email: "testTeacherFiap@email.com.br",
      user_pass: "12345678",
    });
  });

  it("should create a post", async () => {
    const postData = {
      post_title: "This is the teacher post from a test",
      post_description:
        "Here you can see a clear example of how the test is working",
      post_video_url: "randomvideo.com.br",
    };

    const responsePost = await agent.post("/posts").send(postData);
    postId = responsePost.body.postCreated._id;
    expect(responsePost.statusCode).toBe(201);
    expect(postId).toBeDefined();
  });

  it("should list posts", async () => {
    const getAllPosts = await agent.get("/posts");

    expect(getAllPosts.statusCode).toBe(200);
    expect(getAllPosts.body.length).toBeGreaterThan(0);
  });

  it("should update own post", async () => {
    const postData = {
      post_title: "This is the teacher post from a test edited",
      post_video_url: "randomvideoedited.com.br",
    };
    const responsePost = await agent.put(`/posts/${postId}`).send(postData);
    expect(responsePost.statusCode).toBe(200);
  });
  it("should get only one post", async () => {
    const responsePost = await agent.get(`/posts/${postId}`);
    expect(responsePost.statusCode).toBe(200);
  });

  it("should delete own post", async () => {
    const responsePost = await agent.delete(`/posts/${postId}`);
    expect(responsePost.statusCode).toBe(200);
  });
});

describe("Logout", () => {
  it("should logout", async () => {
    const response = await request(app).get("/users/logout");
    expect(response.statusCode).toBe(204);
  });
});
