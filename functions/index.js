const functions = require("firebase-functions");
const vision = require("@google-cloud/vision");
const cors = require("cors");
const express = require("express");

const app = express();
const client = new vision.ImageAnnotatorClient();

// Handle CORS for all routes
app.use(cors({ origin: true }));
app.use(express.json());

// Main endpoint: label + safe-search detection
app.post("/", async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).send("Image URL is required");
    }

    // Label detection
    const [labelResult] = await client.labelDetection(imageUrl);
    const labels = labelResult.labelAnnotations.map(label => ({
      description: label.description,
      score: label.score,
    }));

    // SafeSearch detection
    const [safeResult] = await client.safeSearchDetection(imageUrl);
    const safeSearch = safeResult.safeSearchAnnotation;

    res.status(200).json({ labels, safeSearch });
  } catch (error) {
    console.error("Vision API error:", error);
    res.status(500).send("Error processing image");
  }
});

exports.analyzeImageLabels = functions.https.onRequest(app);
/**
 * This function analyzes an image using Google Cloud Vision API to detect labels.
 * It expects a POST request with a JSON body containing the image URL.
 * The response will include the detected labels and their confidence scores.
 *
 * It handles CORS globally and explicitly for preflight (OPTIONS) requests.
 * Make sure the function is deployed and unauthenticated access is allowed.
 */
