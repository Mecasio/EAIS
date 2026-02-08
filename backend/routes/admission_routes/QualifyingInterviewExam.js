const express = require("express");
const { db, db3 } = require("../database/database");

const router = express.Router();


// ================== INSERT INTERVIEW SCHEDULE ==================
router.post("/insert_interview_schedule", async (req, res) => {
  const {
    day_description,
    building_description,
    room_description,
    start_time,
    end_time,
    interviewer,
    room_quota,
  } = req.body;

  const [conflicts] = await db.query(
    `SELECT *
     FROM interview_exam_schedule
     WHERE day_description = ?
       AND building_description = ?
       AND room_description = ?
       AND (
            (start_time < ? AND end_time > ?) OR
            (start_time < ? AND end_time > ?) OR
            (start_time >= ? AND end_time <= ?)
       )`,
    [
      day_description,
      building_description,
      room_description,
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time,
    ]
  );

  if (conflicts.length > 0) {
    return res.status(400).json({ error: "⚠️ Conflict: Room already booked." });
  }

  await db.query(
    `INSERT INTO interview_exam_schedule
     (day_description, building_description, room_description, start_time, end_time, interviewer, room_quota)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      interviewer,
      room_quota,
    ]
  );

  res.json({ success: true });
});


router.put("/update_interview_schedule/:id", async (req, res) => {
  const { id } = req.params;
  const {
    day_description,
    building_description,
    room_description,
    start_time,
    end_time,
    interviewer,
    room_quota,
  } = req.body;

  const [conflicts] = await db.query(
    `SELECT schedule_id
     FROM interview_exam_schedule
     WHERE schedule_id != ?
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
      end_time,
      start_time,
      end_time,
      start_time,
      start_time,
      end_time,
    ]
  );

  if (conflicts.length > 0) {
    return res.status(400).json({ error: "⚠️ Conflict detected." });
  }

  await db.query(
    `UPDATE interview_exam_schedule
     SET day_description = ?,
         building_description = ?,
         room_description = ?,
         start_time = ?,
         end_time = ?,
         interviewer = ?,
         room_quota = ?
     WHERE schedule_id = ?`,
    [
      day_description,
      building_description,
      room_description,
      start_time,
      end_time,
      interviewer,
      room_quota,
      id,
    ]
  );

  res.json({ success: true });
});




// ================== DELETE INTERVIEW SCHEDULE ==================
router.delete("/delete_interview_schedule/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM interview_exam_schedule WHERE schedule_id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
