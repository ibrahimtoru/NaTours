const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Tour = require("../../models/tour-model");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// const DB = process.env.LOCAL_DATABASE;

mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("DB Connected"));

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//   console.log(`App running on port ${port}`);
// });

// Read json file
const filePath = `${__dirname}/tours.json`;
const tours = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const fileName = path.basename(filePath);
// import data into database;
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log(
      `Inserted all documents from file "${fileName}" to collection ${Tour.collection.collectionName}`
    );
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log(
      `Deleted all documents from the collection ${Tour.collection.collectionName}`
    );
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

if (process.argv[2] === "--import") importData();
else if (process.argv[2] === "--delete") deleteData();
