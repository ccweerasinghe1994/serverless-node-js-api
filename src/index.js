const serverless = require("serverless-http");
const express = require("express");
const { getDbClient } = require("./db/clients");
const { getLeads, newLead, getLeadById } = require("./db/crud");
const { emailValidator } = require("./db/validator");

console.log("Starting serverless function");
const app = express();
app.use(express.json());

app.get("/", async (req, res, next) => {
    const sql = await getDbClient();
    const now = Date.now();
    const [dbResult] = await sql`select now()`;
    return res.status(200).json({
        message: "Hello from root!",
        result: (dbResult.now.getTime() - now) / 1000 + " seconds",
    });
});

app.get("/path", (req, res, next) => {
    return res.status(200).json({
        message: "Hello from path!",
    });
});

app.get("/leads", async (req, res, next) => {
    const data = await getLeads();
    return res.status(200).json({
        data
    });
});

app.get("/leads/:id", async (req, res, next) => {
    const { id } = req.params;
    const data = await getLeadById(id);
    return res.status(200).json({
        data
    });
});
app.post("/leads", async (req, res, next) => {
    const { email } = req.body;
    const { data, hasError, message } = emailValidator({ email });
    if (hasError) {
        return res.status(400).json({
            error: message,
            data: null,
            hasError
        });
    }
    const savedLead = await newLead(data.email);
    return res.status(200).json({
        data: savedLead,
        hasError,
        message
    });
});
app.use((req, res, next) => {
    return res.status(404).json({
        error: "Not Found",
    });
});

module.exports.handler = serverless(app);