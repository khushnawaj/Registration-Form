const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

// Connect to MongoDB
mongoose
  .connect(
    `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(
      password
    )}@khushnawaj.nkq1wij.mongodb.net/registrationFormDB`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define registration schema
const registrationSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Registration = mongoose.model("Registration", registrationSchema);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "pages")));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "index.html"));
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await Registration.findOne({ email: email });

    if (!existingUser) {
      // Create new registration document
      const registrationData = new Registration({
        name,
        email,
        password,
      });

      // Save the new registration data to MongoDB
      await registrationData.save();
      
      // Redirect to success page
      res.redirect("/success");
    } else {
      // User already exists, redirect to error page
      res.redirect("/error");
    }
  } catch (error) {
    // Handle registration error, redirect to error page
    console.error("Registration error:", error);
    res.redirect("/error");
  }
});

app.get("/success", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "success.html"));
});

app.get("/error", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "error.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
