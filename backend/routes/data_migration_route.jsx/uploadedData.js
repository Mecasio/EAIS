const express = require("express");
const { db, db3 } = require("../database/database");

const router = express.Router();

router.get("/get_uploaded_students", async (req, res) => {
  
  try {
    const sql = `
      SELECT 
        es.student_number,
        pt.first_name,
        pt.last_name,
        pt.middle_name,
        dt.dprtmnt_id,
        dt.dprtmnt_name,
        dt.dprtmnt_code,
        es.curriculum_id,
        pgt.program_id,
        pgt.program_description,
        pgt.program_code,
        ylt.year_level_id,
        ylt.year_level_description,
        ayt.year_id,
        ayt.year_description,
        smt.semester_id,
        smt.semester_description,
        es.course_id,
        ct.course_code,
        es.created_at
      FROM enrolled_subject es
      INNER JOIN student_status_table sst ON es.student_number = sst.student_number
        AND es.active_school_year_id = sst.active_school_year_id
      INNER JOIN student_numbering_table snt ON sst.student_number = snt.student_number
      INNER JOIN person_table pt ON snt.person_id = pt.person_id
      INNER JOIN curriculum_table cct ON sst.active_curriculum = cct.curriculum_id
      LEFT JOIN dprtmnt_curriculum_table dct ON cct.curriculum_id = dct.curriculum_id
      LEFT JOIN dprtmnt_table dt ON dct.dprtmnt_id = dt.dprtmnt_id
      INNER JOIN program_table pgt ON cct.program_id = pgt.program_id
      INNER JOIN year_level_table ylt ON sst.year_level_id = ylt.year_level_id
      INNER JOIN course_table ct ON es.course_id = ct.course_id
      INNER JOIN active_school_year_table sy ON es.active_school_year_id = sy.id
      INNER JOIN year_table ayt ON sy.year_id = ayt.year_id
      INNER JOIN semester_table smt ON sy.semester_id = smt.semester_id
      GROUP BY es.student_number, sst.year_level_id, es.active_school_year_id;`;

    const [rows] = await db3.query(sql);

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({error: "Failed in Fetching Uploaded Data"});
  }
});

module.exports = router;
