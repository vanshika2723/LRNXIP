
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) =>
    console.error("MongoDB connection error:", error.message)
  );

// Home Route
app.get("/", (req, res) => {
  res.json({
    message: "Learnix Student Management API is running!"
  });
});

// GET: Get All Students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add Student
app.post("/students", async (req, res) => {
  try {
    const { name, email, domain, status } = req.body;

    if (!name || !email || !domain) {
      return res.status(400).json({
        message: "Name, email, and domain are required."
      });
    }

    const student = await Student.create({
      name,
      email,
      domain,
      status: status || "Active"
    });

    res.status(201).json({
      message: "Student added successfully!",
      student
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000
        ? "Email already exists."
        : error.message
    });
  }
});

// PUT: Update Complete Student Details
app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, domain, status } = req.body;

    // Validation
    if (!name || !email || !domain || !status) {
      return res.status(400).json({
        message: "All student fields are required."
      });
    }

    if (!["Active", "Inactive", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid student status."
      });
    }

    // Update all fields in MongoDB
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        email: email.trim(),
        domain,
        status
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    res.json({
      message: "Student updated successfully!",
      student
    });

  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000
        ? "This email is already registered."
        : error.message
    });
  }
});

// DELETE: Delete Student
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found."
      });
    }

    res.json({
      message: "Student deleted successfully!"
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Server Start
mongoose.connection.once("open", () => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
