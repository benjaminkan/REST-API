const express = require("express");
const mongoose = require("mongoose");

const app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('pages'));

// Connect to mongodb
var uri = "mongodb://testuser:demopass@cluster0-shard-00-00-bzwgx.mongodb.net:27017,cluster0-shard-00-01-bzwgx.mongodb.net:27017,cluster0-shard-00-02-bzwgx.mongodb.net:27017/fifawc18?replicaSet=Cluster0-shard-0&ssl=true&authSource=admin";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const teams = mongoose.model(
    "Team",
    {
        name: String,
        fifaCode: String,
    },
    "teams"
);


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/pages/index.html");
});

// Return a list of all documents in the collection
app.get("/api/getteams", (req, res) => {
    teams.find({}, null, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error 500; error occured while fetching data from the database.");
        }
        else {
            res.status(200).json(results);
        };
    });
});

// Return details of the document with a specified id
app.get("/api/getteam/:id", (req, res) => {
    teams.findById(req.params.id, (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error 500. Error ocured while fetching data from the database.')
        }
        else {
            res.status(200).json(results);
        };
    });
});

// Create a new document in the collection
app.post("/api/addteam/id=:id/name=:name/fifaCode=:fifaCode", (req, res) => {
    let entry = {
        _id: req.params.id,
        name: req.params.title,
        fifaCode: req.params.year
    };

    mongoose.connection.collection('teams').insertOne(entry, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error occured while making a new entry.');
        }
        else {
            console.log(`Inserted: ${result.insertedCount}`);
            console.log(`Entry saved! ID: ${entry._id}`);
            res.status(200).send(`New entry with id ${entry._id} added successfully to the database!`);
        };
    });
});

// Update the document with a specified id
app.patch("/api/updateteam/id=:id/name=:name/fifaCode=:fifaCode", (req, res) => {
    let id = req.params.id;
    let update = {
        name: req.params.title,
        fifaCode: req.params.year
    };

    teams.findByIdAndUpdate(id, update, { new: true }, (err, result) => {
        if (err) {
            console.log('Error occured while trying to update entry.');
        }
        else {
            console.log(`Entry with an id ${id} updated successfully!`);
            console.log(result);
            res.status(200).send(`Entry with an id ${id} updated successfully!`);
        };
    });
});

// Delete the document with a specified id
app.delete("/api/deleteteam/:id", (req, res) => {
    let id = req.params.id;

    teams.findByIdAndDelete(id, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error occured while deleting entry.');
        }
        else {
            console.log(`Entry with an ID:${id} deleted successfully.`);
            res.status(200).send(`Entry with an ID:${id} deleted successfully.`);
        };
    });
});

const port = process.env.PORT || 5000
app.listen(port);
console.log("Listening to port 5000");
