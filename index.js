import express, { response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { toJson } from "xml2json";
import fs from "fs";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./swagger.js";

const app = express();
dotenv.config();

app.use(morgan('combined'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT;
const BASE_URL = "http://luasforecasts.rpa.ie/xml/get.ashx";

/** All Methods */
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *     - Index
 *     summary: API index
 *     description: Checks status of API.
 *     responses:
 *       200:
 *         description: Successful response.
 */
app.get("/", (req, res)=>{
    res.send("REST-ful API for getting realtime data for Dublin green and red lines luas schedule and fares");
});



/**
 * @swagger
 * /stop/{stopAbv}:
 *   get:
 *     tags:
 *     - Luas Stop Times
 *     summary: Stop times
 *     parameters:
 *     - name: stopAbv
 *       in: path
 *       description: Abbreviated stop name
 *       required: true
 *     description: Gets time in minutes for next luas to arrive at the stop on the red or green line
 *     responses:
 *       200:
 *         description: Successful response with Luas arrival times.
 *       500:
 *         description: Error occurred on Server
 */
app.get("/stop/:stopAbv", async (req, res) => {
    try {
        const stopAbv = req.params.stopAbv;
        const URL = `${BASE_URL}?action=forecast&stop=${stopAbv}&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));
     
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.response.data);
    }
   
});

/**
 * @swagger
 * /fareCalculator:
 *   get:
 *     tags:
 *     - Fare Calculator
 *     summary: Fare Calculator
 *     parameters:
 *     - name: from
 *       in: query
 *       description: Abbreviated stop name of source stop
 *       required: true
 *     - name: to
 *       in: query
 *       description: Abbreviated stop name of destination stop
 *       required: true
 *     - name: adults
 *       in: query
 *       description: Number of adults making the journey
 *       required: true
 *     - name: children
 *       in: query
 *       description: Number of children making the journey
 *       required: true
 *     description: Calculates and returns the fare for an adult/child from one stop to another on the red or green line
 *     responses:
 *       200:
 *         description: Successful response with Fare for the journey.
 *       500:
 *         description: Error occurred on Server
 */
app.get("/fareCalculator", async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const adults = req.query.adults;
        const children = req.query.children;

        const URL = `${BASE_URL}?action=farecalc&from=${from}&to=${to}&adults=${adults}&children=${children}&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));

        if (JSON.stringify(data).includes("Error")){
            res.status(400).send(data);
        }else{
            res.status(200).send(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
   
});

/**
 * @swagger
 * /stopLocations:
 *   get:
 *     tags:
 *     - Stop Locations
 *     summary: Stop Locations
 *     description: Get lat, long locations for all the stops on the red and green line.
 *     responses:
 *       200:
 *         description: Successful response.
 */
app.get("/stopLocations", async (req, res) => {
    try {
        const URL = `${BASE_URL}?action=stops&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));

        if (JSON.stringify(data).includes("Error")){
            res.status(400).send(data);
        }else{
            fs.writeFile("stopLocations.json", JSON.stringify(data), (error) => {
                if (error) {
                  console.error(error);
                  throw error;
                }
            });
    
            res.status(200).send(data);
        }

    } catch (error) {
        console.log(error);
        res.status(404).send(error.response.data);
    }
   
});

// TODO: get news
app.get("/travelNews", async (req, res) => {
    try {
        const URL = `${BASE_URL}?action=stops&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));
        
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.response.data);
    }
   
});

/**
 * @swagger
 * /status:
 *   get:
 *     tags:
 *     - Luas Travel Updates
 *     summary: Luas Status Check
 *     description: Checks status of the Luas.
 *     responses:
 *       200:
 *         description: Successful response.
 */
app.get("/status", async (req, res) => {
    try {
        const greenLineStop = "HAR";
        const redLineStop = "ABB";
        const greenLineStatus = await getLuasLineStatus(greenLineStop);
        const redLineStatus = await getLuasLineStatus(redLineStop);
     
        res.status(200).send(`${greenLineStatus} \n ${redLineStatus}`);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.response.data);
    }
   
});

async function getLuasLineStatus(stop) {
    try {
    const URL = `${BASE_URL}?action=forecast&stop=${stop}&encrypt=false`;
    const response = await axios.get(URL);
    const data = JSON.parse(toJson(response.data));
    const message = data["stopInfo"]["message"];
    
    return message;
} catch (error) {
    console.log(error);
    res.status(404).send(error);
}
}


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
