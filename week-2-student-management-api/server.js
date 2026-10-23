
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => console.error("MongoDB connection error:", error.message));

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Learnix Student Management API is running!" });
});

// GET: Get all students
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a student
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
      status
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      message: error.code === 11000
        ? "Email already exists."
        : error.message
    });
  }
});

// PUT: Update a student's status
app.put("/students/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive", "Completed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be Active, Inactive, or Completed."
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE: Delete a student
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
