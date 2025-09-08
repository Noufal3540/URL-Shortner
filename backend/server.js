import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import pool from "./pool.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ URL validation function
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

// POST /shorten
app.post("/shorten", async (req, res) => {
  const { url } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    // ✅ Check for duplicate
    const existing = await pool.query(
      "SELECT * FROM urls WHERE original_url = $1",
      [url]
    );

    if (existing.rows.length > 0) {
      return res.json({
        shortUrl: `http://localhost:${process.env.PORT}/${existing.rows[0].short_code}`,
        originalUrl: existing.rows[0].original_url,
        message: "Already exists",
      });
    }

    // ✅ Generate new short code
    const shortCode = nanoid(6);

    const result = await pool.query(
      "INSERT INTO urls (original_url, short_code) VALUES ($1, $2) RETURNING *",
      [url, shortCode]
    );

    res.json({
      shortUrl: `http://localhost:${process.env.PORT}/${result.rows[0].short_code}`,
      originalUrl: result.rows[0].original_url,
      message: "New short link created",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /:shortCode
app.get("/:shortCode", async (req, res) => {
    const { shortCode } = req.params;
  
    try {
      const result = await pool.query(
        "SELECT * FROM urls WHERE short_code = $1",
        [shortCode]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Short URL not found" });
      }
  
      const urlData = result.rows[0];
  
      // ✅ Increment clicks
      await pool.query(
        "UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1",
        [shortCode]
      );
  
      // ✅ Redirect
      res.redirect(urlData.original_url);
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
