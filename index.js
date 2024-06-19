import express, { response } from "express";
import dotenv from "dotenv";
import axios from "axios";
import { toJson } from "xml2json";

const app = express();
dotenv.config();

const port = process.env.PORT;


app.get("/", (req, res)=>{
    res.send("REST-ful API for getting realtime data for Dublin green and red lines luas schedule and fares");
});

// TODO: get stop information
app.get("/stop/:stopAbv", async (req, res) => {
    try {
        const stopAbv = req.params.stopAbv;
        const URL = `http://luasforecasts.rpa.ie/xml/get.ashx?action=forecast&stop=${stopAbv}&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));
     
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.response.data);
    }
   
});

// TODO: get fares
app.get("/fareCalculator", async (req, res) => {
    try {
        const from = req.query.from;
        const to = req.query.to;
        const adults = req.query.adults;
        const children = req.query.children;

        const URL = `http://luasforecasts.rpa.ie/xml/get.ashx?action=farecalc&from=${from}&to=${to}&adults=${adults}&children=${children}&encrypt=false`;
        const response = await axios.get(URL);
        const data = JSON.parse(toJson(response.data));
     
        res.status(200).send(data);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.response.data);
    }
   
});

// TODO: get news



app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
