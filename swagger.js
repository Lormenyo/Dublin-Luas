import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dublin Luas Real-time Data API',
      version: '1.0.0',
      description: 'API documentation for your Dublin Luas Real-time Data API',
      contact: {
        name: "Hannah Lormenyo",
        email: "lormenyoh@gmail.com",
        url: "https://github.com/Lormenyo/Dublin-Luas-API"
      },
      version: '1.0.0',
    },
    servers: [
        {
          url: "http://localhost:3000/",
          description: "Local server"
        },
        {
          url: "https://dublin-luas-api.onrender.com",
          description: "Live server"
        },
      ]
  },
  apis: ['./*.js'], // Path to the API routes
};
const swaggerSpec = swaggerJSDoc(options);
// module.exports = swaggerSpec;
export default swaggerSpec;