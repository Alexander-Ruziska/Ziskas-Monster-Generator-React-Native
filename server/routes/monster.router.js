const express = require("express");
const OpenAI = require("openai");
const pool = require("../modules/pool.js");
const router = express.Router();
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const { rejectUnauthenticated } = require("../modules/authentication-middleware.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/*Generates a new monster, image, and stores it in the database.*/
router.post("/", async (req, res) => {
  try {
    const { name, challenge_rating, armor_class, environment, resistances, type } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a dungeon master. Reply strictly in JSON format with all required fields.",
        },
        {
          role: "user",
          content: `Create a high-quality fantasy illustration of a monster for Dungeons & Dragons 5e.

- Name: ${name}
- Type: ${type}
- Challenge Rating: ${challenge_rating}
- Armor Class: ${armor_class}
- Environment: ${environment}
- Resistances: ${resistances}

The creature should match the lore, style, and design of classic D&D 5e artwork, similar to the Monster Manual. It should have intricate details, a dynamic pose, and a background that reflects its environment.

Use a realistic yet fantastical art style with dramatic lighting, emphasizing its power, abilities, and unique traits. All values must be filled out.

Ensure the monster looks game-ready for a D&D campaign, with clear visual indicators of its strengths, weaknesses, and habitat.`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "creature_schema",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hit_points: { type: "integer" },
              type: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              strength: { type: "integer" },
              dexterity: { type: "integer" },
              constitution: { type: "integer" },
              intelligence: { type: "integer" },
              wisdom: { type: "integer" },
              charisma: { type: "integer" },
              speed: { type: "string" },
              actions: { type: "string" },
              legendary_actions: { type: "string" },
              armor_class: { type: "integer" },
              resistances: { type: "string" },
              immunities: { type: "string" },
              languages: { type: "string" },
              senses: { type: "string" },
              skills: { type: "string" },
              saving_throws: { type: "string" },
              challenge_rating: { type: "string" },
              size: { type: "string" },
              proficiency_bonus: { type: "string" },
              creature_type: { type: "string" },
              alignment: { type: "string" },
              initiative: { type: "integer" },
            },
            required: [
              "hit_points", "type", "name", "description", "strength", "dexterity", "constitution",
              "intelligence", "wisdom", "charisma", "speed", "actions", "legendary_actions", "armor_class",
              "resistances", "immunities", "languages", "senses", "skills", "saving_throws",
              "challenge_rating", "size", "proficiency_bonus", "creature_type", "alignment", "initiative",
            ],
            additionalProperties: false,
          }
        }
      },
      temperature: 0.78,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const unParsedJsonResponse = response.choices[0].message.content;
    if (!unParsedJsonResponse) throw new Error("Missing OpenAI response data");

    req.body = JSON.parse(unParsedJsonResponse);

    const imageResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `A detailed fantasy monster called ${req.body.name}. Description: ${req.body.description}. It is a ${req.body.size} ${req.body.creature_type} with a challenge rating of ${req.body.challenge_rating}.`,
      size: "1024x1024",
      n: 1
    });

    const imageUrl = imageResponse.data[0].url;
    const imageResponseData = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const base64Image = Buffer.from(imageResponseData.data).toString("base64");
    const cloudinaryResult = await cloudinary.uploader.upload(`data:image/png;base64,${base64Image}`, {
      folder: "Monsters"
    });

    const insertQuery = `
      INSERT INTO monster (
        hit_points, user_id, type, image_url, name, description, strength, dexterity, constitution, intelligence,
        wisdom, charisma, armor_class, initiative, speed, actions, legendary_actions, resistances, immunities,
        languages, skills, senses, saving_throws, challenge_rating, size, alignment, proficiency_bonus
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
        $24, $25, $26, $27)
      RETURNING *;
    `;

    const values = [
      req.body.hit_points, req.user.id, req.body.type, cloudinaryResult.secure_url, req.body.name, req.body.description,
      req.body.strength, req.body.dexterity, req.body.constitution, req.body.intelligence, req.body.wisdom,
      req.body.charisma, req.body.armor_class, req.body.initiative, req.body.speed, req.body.actions,
      req.body.legendary_actions, req.body.resistances, req.body.immunities, req.body.languages, req.body.skills,
      req.body.senses, req.body.saving_throws, req.body.challenge_rating, req.body.size, req.body.alignment,
      req.body.proficiency_bonus
    ];

    const lastRecord = await pool.query(insertQuery, values);
    res.json(lastRecord.rows[0]);

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to generate monster and image" });
  }
});

/*Gets all monsters for the authenticated user*/
router.get("/", rejectUnauthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM monster WHERE user_id = $1 ORDER BY name ASC;",
      [req.user.id]
    );
    res.send(result.rows);
  } catch {
    res.status(500).send({ error: "Error fetching monsters" });
  }
});

/*Gets all monsters for admin view*/
router.get("/admin", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM monster ORDER BY id DESC");
    res.send(result.rows);
  } catch {
    res.status(500).json({ error: "Error fetching monsters" });
  }
});

/*Gets a specific monster by ID*/
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM monster WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Monster not found" });
    }
    res.send(result.rows[0]);
  } catch (error) {
    console.error("Error fetching monster details", error);
    res.sendStatus(500);
  }
});

/*Gets image URL for a monster*/
router.get("/image/:id", async (req, res) => {
  const monsterId = req.params.id;
  try {
    const result = await pool.query(
      "SELECT image_url FROM monster WHERE id = $1 LIMIT 1",
      [monsterId]
    );
    if (result.rows.length === 0 || !result.rows[0].image_url) {
      return res.status(404).json({ error: "Image not found" });
    }
    res.json({ image: result.rows[0].image_url });
  } catch (error) {
    console.error("Error fetching monster image", error);
    res.sendStatus(500);
  }
});

/*Deletes a monster by ID (admin can delete any, user can only delete their own)*/
router.delete("/delete/:id", rejectUnauthenticated, async (req, res) => {
  try {
    const userResult = await pool.query(`SELECT "admin" FROM "user" WHERE id = $1;`, [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const isAdmin = userResult.rows[0].admin;
    const query = isAdmin
      ? `DELETE FROM "monster" WHERE "id" = $1;`
      : `DELETE FROM "monster" WHERE "id" = $1 AND "user_id" = $2;`;
    const params = isAdmin ? [req.params.id] : [req.params.id, req.user.id];

    const result = await pool.query(query, params);
    if (result.rowCount === 0) return res.status(403).json({ error: "Unauthorized to delete this monster" });

    res.status(200).json({ message: "Monster deleted successfully" });
  } catch (err) {
    console.error("Error deleting monster:", err);
    res.status(500).json({ error: "Failed to delete monster" });
  }
});

/*Edits monster name by ID for the authenticated user*/
router.put("/edit/:id", rejectUnauthenticated, (req, res) => {
  const query = `
    UPDATE "monster"
    SET "name" = $3
    WHERE "id" = $1 AND "user_id" = $2;
  `;
  pool.query(query, [req.params.id, req.user.id, req.body.name])
    .then(result => res.send(result.rows))
    .catch(err => {
      console.log("Error editing backend", err);
      res.sendStatus(500);
    });
});

module.exports = router;
