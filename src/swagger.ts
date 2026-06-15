import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SPS User Management API",
      version: "1.0.0",
      description: "REST API for user management with JWT authentication",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            type: { type: "string", enum: ["admin", "user"] },
            originalUrl: { type: "string", nullable: true },
            previewUrl: { type: "string", nullable: true },
            attachmentCount: { type: "integer" },
            attachments: {
              type: "array",
              items: { $ref: "#/components/schemas/Attachment" },
            },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            filename: { type: "string" },
            originalName: { type: "string" },
            mimetype: { type: "string" },
            size: { type: "integer" },
            url: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        AuthRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["name", "email", "type", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            type: { type: "string", enum: ["admin", "user"] },
            password: { type: "string" },
          },
        },
        UpdateUserRequest: {
          type: "object",
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            type: { type: "string", enum: ["admin", "user"] },
            password: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export default swaggerJsdoc(options);
