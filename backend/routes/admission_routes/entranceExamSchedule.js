const express = require("express");
const { db, db3 } = require("../database/database");

const router = express.Router();

// ================== INSERT EXAM SCHEDULE ==================
router.post("/insert_exam_schedule", async (req, res) => {
  try {
    const {
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      proctor,
      room_quota,
      active_school_year_id,
    } = req.body;

    console.log("Received schedule data:", req.body); // Debug log

    // 🔍 1. Check for conflicts
    const [conflicts] = await db.query(
      `SELECT * 
       FROM entrance_exam_schedule 
       WHERE day_description = ?
         AND building_description = ?
         AND room_description = ?
         AND (
              (start_time < ? AND end_time > ?) OR   -- new start inside existing
              (start_time < ? AND end_time > ?) OR   -- new end inside existing
              (start_time >= ? AND end_time <= ?)    -- fully overlaps
         )`,
      [
        day_description,
        building_description,
        room_description,
        end_time, start_time,
        end_time, start_time,
        start_time, end_time,
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: "⚠️ Room already exists for this building on this date." });
    }

    // ✅ 2. Insert if no conflict
    await db.query(
      `INSERT INTO entrance_exam_schedule 
         (day_description, building_description, room_description, start_time, end_time, proctor, room_quota, active_school_year_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [day_description, building_description, room_description, start_time, end_time, proctor, room_quota, active_school_year_id]
    );

    res.json({ success: true, message: "Exam schedule saved successfully ✅" });
  } catch (err) {
    console.error("❌ Error inserting exam schedule:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== UPDATE EXAM SCHEDULE ==================
router.put("/update_exam_schedule/:id", async (req, res) => {
  try {
    const { id } = req.params; // this is schedule_id
    const {
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      proctor,
      room_quota,
    } = req.body;

    // 🔍 conflict check (exclude current record)
    const [conflicts] = await db.query(
      `SELECT * FROM entrance_exam_schedule
       WHERE schedule_id != ?   -- use schedule_id instead of id
         AND day_description = ?
         AND building_description = ?
         AND room_description = ?
         AND (
              (start_time < ? AND end_time > ?) OR
              (start_time < ? AND end_time > ?) OR
              (start_time >= ? AND end_time <= ?)
         )`,
      [
        id,
        day_description,
        building_description,
        room_description,
        end_time, start_time,
        end_time, start_time,
        start_time, end_time,
      ]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ error: "⚠️ Conflict: Room already booked." });
    }

    await db.query(
      `UPDATE entrance_exam_schedule
       SET day_description=?, building_description=?, room_description=?,
           start_time=?, end_time=?, proctor=?, room_quota=?
       WHERE schedule_id=?`,   // use schedule_id here
      [
        day_description,
        building_description,
        room_description,
        start_time,
        end_time,
        proctor,
        room_quota,
        id,
      ]
    );

    res.json({ success: true, message: "Schedule updated successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ================== DELETE EXAM SCHEDULE ==================
router.delete("/delete_exam_schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `DELETE FROM entrance_exam_schedule WHERE schedule_id = ?`, // use schedule_id
      [id]
    );

    res.json({ success: true, message: "Schedule deleted successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;