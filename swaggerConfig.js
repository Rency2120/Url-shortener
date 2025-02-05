import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Advanced URL Shortener API",
      version: "1.0.0",
      description: "API documentation for the Advanced URL Shortener",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        CookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
        },
      },
    },
    security: [{ CookieAuth: [] }],
  },

  apis: [
    "./src/routes/authRoutes.js",
    "./src/routes/urlRoutes.js",
    "./src/routes/analyticsRoutes.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

const setUpSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setUpSwagger;
