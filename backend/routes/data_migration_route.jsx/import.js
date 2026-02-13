const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const { db3 } = require("../database/database");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const normalizeText = (value) => String(value ?? "").trim();

const toNullableNumber = (value) => {
  const text = normalizeText(value);
  if (!text) return null;
  const parsed = Number(text);
  return Number.isNaN(parsed) ? null : parsed;
};

const pickValue = (row, candidates) => {
  for (const key of candidates) {
    if (row[key] !== undefined && normalizeText(row[key]) !== "") {
      return row[key];
    }
  }
  return "";
};

const parseStudentName = (fullName) => {
  const text = normalizeText(fullName);
  if (!text) {
    return { lastName: "", firstName: "", middleName: "" };
  }

  const [lastPart = "", restPart = ""] = text.split(",").map((part) => part.trim());
  if (!restPart) {
    return { lastName: lastPart, firstName: "", middleName: "" };
  }

  const nameParts = restPart.split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || "";
  const middleName = nameParts.join(" ");

  return { lastName: lastPart, firstName, middleName };
};

const parseProgramDescription = (programDescription) => {
  const text = normalizeText(programDescription);
  if (!text) {
    return { programCode: "", yearDescription: "" };
  }

  const match = text.match(/^(.*)-(\d{4})$/);
  if (match) {
    return {
      programCode: normalizeText(match[1]),
      yearDescription: normalizeText(match[2]),
    };
  }

  return { programCode: text, yearDescription: "" };
};

const parseAcademicYear = (academicYearText) => {
  const text = normalizeText(academicYearText);
  if (!text) {
    return { yearDescription: "", semesterDescription: "" };
  }

  const [yearRaw = "", semesterRaw = ""] = text.split(",").map((part) => part.trim());
  const yearMatch = normalizeText(yearRaw).match(/^(\d{4})\s*-\s*\d{4}$/);
  const normalizedYear = yearMatch ? yearMatch[1] : normalizeText(yearRaw);

  return {
    yearDescription: normalizedYear,
    semesterDescription: normalizeText(semesterRaw),
  };
};

const mapRemarkToNumeric = (remark) => {
  const value = normalizeText(remark).toUpperCase();
  if (!value) return 0;
  if (value === "PASSED") return 1;
  if (value === "ONGOING" || value === "CURRENTLY ENROLLED") return 0;
  if (value === "FAILED") return 2;
  if (value === "INC" || value === "INCOMPLETE") return 3;
  if (value === "DROP" || value === "DRP") return 4;
  return 0;
};

// -------------------------------------------- FOR FILE UPLOAD IN ENROLLED SUBJECT --------------------------------- //
router.post("/import-xlsx-into-enrolled-subject", upload.single("file"), async (req, res) => {
  const campus = normalizeText(req.body.campus) || null;

  try {
    console.log("[IMPORT] Starting import-xlsx-into-enrolled-subject", {
      campus,
      hasFile: !!req.file,
      originalName: req.file?.originalname,
      size: req.file?.size,
    });

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rawRows.length) {
      return res.status(400).json({ success: false, error: "Excel file is empty" });
    }

    const rows = rawRows.filter((row) => {
      const studentNumber = normalizeText(
        pickValue(row, ["Student Number", "StudentNumber", "student_number"]),
      );
      const courseCode = normalizeText(
        pickValue(row, ["Course ", "Course", "Course Code", "course_code"]),
      );
      return studentNumber || courseCode;
    });

    if (!rows.length) {
      return res.status(400).json({ success: false, error: "No valid rows found" });
    }

    console.log("[IMPORT] Parsed Excel rows", {
      rawRowCount: rawRows.length,
      validRowCount: rows.length,
    });

    // Step 1: Group by student number + academic year.
    const groupedMap = new Map();
    for (const row of rows) {
      const studentNumber = normalizeText(
        pickValue(row, ["Student Number", "StudentNumber", "student_number"]),
      );
      const academicYear = normalizeText(
        pickValue(row, ["Academic Year", "AcademicYear", "academic_year"]),
      );

      if (!studentNumber || !academicYear) continue;

      const key = `${studentNumber}__${academicYear}`;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, { studentNumber, academicYear, rows: [] });
      }
      groupedMap.get(key).rows.push(row);
    }

    if (!groupedMap.size) {
      return res.status(400).json({
        success: false,
        error: "No rows with both Student Number and Academic Year were found",
      });
    }

    console.log("[IMPORT] Grouped rows", {
      groupedRecords: groupedMap.size,
    });

    const connection = await db3.getConnection();
    let createdPersons = 0;
    let processedStudents = 0;
    let insertedSubjects = 0;
    let updatedSubjects = 0;
    const skippedItems = [];
    const seenRowSignatures = new Set();

    try {
      await connection.beginTransaction();

      for (const group of groupedMap.values()) {
        const firstRow = group.rows[0];
        const studentNumber = group.studentNumber;
        const studentName = pickValue(firstRow, ["Student Name", "StudentName", "student_name"]);
        const programDescription = pickValue(firstRow, [
          "Program Description",
          "ProgramDescription",
          "program_description",
        ]);
        const yearLevelDescription = normalizeText(
          pickValue(firstRow, ["Year Level", "YearLevel", "year_level_description"]),
        );

        const { yearDescription: schoolYearDescription, semesterDescription } = parseAcademicYear(
          group.academicYear,
        );
        const { programCode, yearDescription: curriculumYearDescription } =
          parseProgramDescription(programDescription);
        const { firstName, middleName, lastName } = parseStudentName(studentName);

        console.log("[IMPORT][GROUP] Extracted metadata", {
          studentNumber,
          studentName,
          parsedName: { lastName, firstName, middleName },
          programDescription,
          parsedProgram: { programCode, curriculumYearDescription },
          yearLevelDescription,
          academicYearRaw: group.academicYear,
          parsedAcademicYear: { schoolYearDescription, semesterDescription },
          rowsInGroup: group.rows.length,
        });

        if (
          !studentNumber ||
          !programCode ||
          !curriculumYearDescription ||
          !yearLevelDescription ||
          !schoolYearDescription ||
          !semesterDescription
        ) {
          skippedItems.push({
            studentNumber,
            reason: "Missing required student metadata (program/year level/school year/semester)",
          });
          continue;
        }

        // Step 5 + 6: Resolve curriculum from program code + curriculum year description.
        const [programRows] = await connection.query(
          `SELECT program_id FROM program_table WHERE UPPER(TRIM(program_code)) = UPPER(TRIM(?)) LIMIT 1`,
          [programCode],
        );

        if (!programRows.length) {
          console.log("[IMPORT][GROUP] Program not found", { studentNumber, programCode });
          skippedItems.push({ studentNumber, reason: `Program not found: ${programCode}` });
          continue;
        }

        const [currYearRows] = await connection.query(
          `SELECT year_id FROM year_table WHERE TRIM(year_description) = TRIM(?) LIMIT 1`,
          [curriculumYearDescription],
        );
        
        if (!currYearRows.length) {
          console.log("[IMPORT][GROUP] Curriculum year not found", {
            studentNumber,
            curriculumYearDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `Curriculum year not found: ${curriculumYearDescription}`,
          });
          continue;
        }

        const [curriculumRows] = await connection.query(
          `SELECT curriculum_id
           FROM curriculum_table
           WHERE year_id = ? AND program_id = ?
           LIMIT 1`,
          [currYearRows[0].year_id, programRows[0].program_id],
        );
        if (!curriculumRows.length) {
          console.log("[IMPORT][GROUP] Curriculum not found", {
            studentNumber,
            programCode,
            curriculumYearDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `Curriculum not found for program=${programCode} year=${curriculumYearDescription}`,
          });
          continue;
        }

        const curriculumId = curriculumRows[0].curriculum_id;
        console.log("[IMPORT][GROUP] Resolved curriculum", {
          studentNumber,
          programId: programRows[0].program_id,
          curriculumYearId: currYearRows[0].year_id,
          curriculumId,
        });

        // Step 7: Resolve year level id.
        const [yearLevelRows] = await connection.query(
          `SELECT year_level_id
           FROM year_level_table
           WHERE UPPER(TRIM(year_level_description)) = UPPER(TRIM(?))
           LIMIT 1`,
          [yearLevelDescription],
        );
        if (!yearLevelRows.length) {
          console.log("[IMPORT][GROUP] Year level not found", {
            studentNumber,
            yearLevelDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `Year level not found: ${yearLevelDescription}`,
          });
          continue;
        }

        const yearLevelId = yearLevelRows[0].year_level_id;
        console.log("[IMPORT][GROUP] Resolved year level", {
          studentNumber,
          yearLevelDescription,
          yearLevelId,
        });

        // Step 8: Resolve active school year id using year + semester description.
        const [schoolYearRows] = await connection.query(
          `SELECT year_id FROM year_table WHERE TRIM(year_description) = TRIM(?) LIMIT 1`,
          [schoolYearDescription],
        );
        if (!schoolYearRows.length) {
          console.log("[IMPORT][GROUP] School year not found", {
            studentNumber,
            schoolYearDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `School year not found: ${schoolYearDescription}`,
          });
          continue;
        }

        const [semesterRows] = await connection.query(
          `SELECT semester_id
           FROM semester_table
           WHERE UPPER(TRIM(semester_description)) = UPPER(TRIM(?))
           LIMIT 1`,
          [semesterDescription],
        );
        if (!semesterRows.length) {
          console.log("[IMPORT][GROUP] Semester not found", {
            studentNumber,
            semesterDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `Semester not found: ${semesterDescription}`,
          });
          continue;
        }

        const [activeSchoolYearRows] = await connection.query(
          `SELECT id
           FROM active_school_year_table
           WHERE year_id = ? AND semester_id = ?
           LIMIT 1`,
          [schoolYearRows[0].year_id, semesterRows[0].semester_id],
        );
        if (!activeSchoolYearRows.length) {
          console.log("[IMPORT][GROUP] Active school year not found", {
            studentNumber,
            schoolYearDescription,
            semesterDescription,
          });
          skippedItems.push({
            studentNumber,
            reason: `Active school year not found for ${schoolYearDescription}, ${semesterDescription}`,
          });
          continue;
        }

        const activeSchoolYearId = activeSchoolYearRows[0].id;
        console.log("[IMPORT][GROUP] Resolved active school year", {
          studentNumber,
          schoolYearId: schoolYearRows[0].year_id,
          semesterId: semesterRows[0].semester_id,
          activeSchoolYearId,
        });

        // Step 10/11/12: Resolve section, course, remarks, and pre-check duplicates first.
        const rowsToInsert = [];
        for (const row of group.rows) {
          const sectionDescription = normalizeText(
            pickValue(row, ["Section", "section", "Section Description"]),
          );
          const courseCode = normalizeText(
            pickValue(row, ["Course ", "Course", "Course Code", "course_code"]),
          );

          if (!sectionDescription || !courseCode) {
            console.log("[IMPORT][ROW] Missing section/course", {
              studentNumber,
              sectionDescription,
              courseCode,
            });
            skippedItems.push({
              studentNumber,
              reason: "Missing section or course code in row",
            });
            continue;
          }

          const [sectionRows] = await connection.query(
            `SELECT id FROM section_table WHERE UPPER(TRIM(description)) = UPPER(TRIM(?)) LIMIT 1`,
            [sectionDescription],
          );
          if (!sectionRows.length) {
            console.log("[IMPORT][ROW] Section not found", {
              studentNumber,
              sectionDescription,
            });
            skippedItems.push({
              studentNumber,
              reason: `Section not found: ${sectionDescription}`,
            });
            continue;
          }

          const [departmentSectionRows] = await connection.query(
            `SELECT id
             FROM dprtmnt_section_table
             WHERE section_id = ? AND curriculum_id = ?
             LIMIT 1`,
            [sectionRows[0].id, curriculumId],
          );
          if (!departmentSectionRows.length) {
            console.log("[IMPORT][ROW] Department section mapping not found", {
              studentNumber,
              sectionId: sectionRows[0].id,
              curriculumId,
            });
            skippedItems.push({
              studentNumber,
              reason: `Department section mapping not found for section=${sectionDescription} curriculum=${curriculumId}`,
            });
            continue;
          }

          const [courseRows] = await connection.query(
            `SELECT course_id FROM course_table WHERE UPPER(TRIM(course_code)) = UPPER(TRIM(?)) LIMIT 1`,
            [courseCode],
          );
          if (!courseRows.length) {
            console.log("[IMPORT][ROW] Course not found", {
              studentNumber,
              courseCode,
            });
            skippedItems.push({
              studentNumber,
              reason: `Course not found: ${courseCode}`,
            });
            continue;
          }

          const midterm = toNullableNumber(pickValue(row, ["Midterm", "midterm"]));
          const finals = toNullableNumber(pickValue(row, ["Finals", "finals"]));
          const finalGrade = toNullableNumber(
            pickValue(row, ["Final Grade", "FinalGrade", "final_grade"]),
          );
          const enRemarks = mapRemarkToNumeric(
            pickValue(row, ["Remarks", "Remark", "remarks", "remark"]),
          );

          console.log("[IMPORT][ROW] Extracted row payload", {
            studentNumber,
            courseCode,
            courseId: courseRows[0].course_id,
            sectionDescription,
            sectionId: sectionRows[0].id,
            departmentSectionId: departmentSectionRows[0].id,
            curriculumId,
            yearLevelId,
            activeSchoolYearId,
            midterm,
            finals,
            finalGrade,
            enRemarks,
          });

          const rowSignature = [
            studentNumber,
            curriculumId,
            courseRows[0].course_id,
            yearLevelId,
            departmentSectionRows[0].id,
            activeSchoolYearId,
            normalizeText(lastName).toUpperCase(),
            normalizeText(firstName).toUpperCase(),
            normalizeText(middleName).toUpperCase(),
          ].join("|");

          // Prevent duplicate rows within the same uploaded file.
          if (seenRowSignatures.has(rowSignature)) {
            console.log("[IMPORT][ROW] Duplicate in uploaded file, skipping", {
              studentNumber,
              rowSignature,
            });
            skippedItems.push({
              studentNumber,
              reason: `${studentNumber}'s Data Already exist`,
            });
            continue;
          }

          const [existingExactData] = await connection.query(
            `SELECT es.id
             FROM enrolled_subject es
             INNER JOIN student_status_table sst ON sst.student_number = es.student_number
             INNER JOIN student_numbering_table snt ON snt.student_number = es.student_number
             INNER JOIN person_table pt ON pt.person_id = snt.person_id
             WHERE es.student_number = ?
               AND es.curriculum_id = ?
               AND es.course_id = ?
               AND es.active_school_year_id = ?
               AND es.department_section_id = ?
               AND sst.year_level_id = ?
               AND UPPER(TRIM(pt.last_name)) = UPPER(TRIM(?))
               AND UPPER(TRIM(pt.first_name)) = UPPER(TRIM(?))
               AND UPPER(TRIM(COALESCE(pt.middle_name, ''))) = UPPER(TRIM(?))
             LIMIT 1`,
            [
              studentNumber,
              curriculumId,
              courseRows[0].course_id,
              activeSchoolYearId,
              departmentSectionRows[0].id,
              yearLevelId,
              lastName,
              firstName,
              middleName || "",
            ],
          );

          if (existingExactData.length > 0) {
            console.log("[IMPORT][ROW] Duplicate in database, skipping", {
              studentNumber,
              existingId: existingExactData[0].id,
            });
            skippedItems.push({
              studentNumber,
              reason: `${studentNumber}'s Data Already exist`,
            });
            seenRowSignatures.add(rowSignature);
            continue;
          }

          rowsToInsert.push({
            studentNumber,
            curriculumId,
            courseId: courseRows[0].course_id,
            activeSchoolYearId,
            midterm,
            finals,
            finalGrade,
            enRemarks,
            departmentSectionId: departmentSectionRows[0].id,
          });
          seenRowSignatures.add(rowSignature);
        }

        // Do not touch any student/person/status rows if all entries are duplicates/skipped.
        if (rowsToInsert.length === 0) {
          console.log("[IMPORT][GROUP] No new rows to insert, no update/insert performed", {
            studentNumber,
          });
          processedStudents += 1;
          continue;
        }

        // Step 2 + 3 + 4: Insert only (no updates) person, person status, student numbering.
        let personId = null;
        const [existingStudentNumber] = await connection.query(
          `SELECT person_id FROM student_numbering_table WHERE student_number = ? LIMIT 1`,
          [studentNumber],
        );

        if (existingStudentNumber.length > 0) {
          personId = existingStudentNumber[0].person_id;
          console.log("[IMPORT][GROUP] Existing student_number found (no update)", {
            studentNumber,
            personId,
          });
        } else {
          const [personInsert] = await connection.query(
            `INSERT INTO person_table (campus, last_name, first_name, middle_name)
             VALUES (?, ?, ?, ?)`,
            [campus, lastName, firstName, middleName || null],
          );
          personId = personInsert.insertId;
          createdPersons += 1;

          await connection.query(
            `INSERT INTO student_numbering_table (student_number, person_id)
             VALUES (?, ?)`,
            [studentNumber, personId],
          );

          console.log("[IMPORT][GROUP] Inserted new person + student_number", {
            studentNumber,
            personId,
            campus,
          });
        }

        await connection.query(
          `INSERT IGNORE INTO person_status_table (person_id, student_registration_status)
           VALUES (?, 1)`,
          [personId],
        );

        console.log("[IMPORT][GROUP] Inserted person_status if missing (no update)", {
          studentNumber,
          personId,
          student_registration_status: 1,
        });

        // Step 9: Insert student status only if missing (no updates).
        await connection.query(
          `INSERT IGNORE INTO student_status_table
            (student_number, active_curriculum, enrolled_status, year_level_id, active_school_year_id, control_status)
           VALUES (?, ?, 1, ?, ?, 0)`,
          [studentNumber, curriculumId, yearLevelId, activeSchoolYearId],
        );

        console.log("[IMPORT][GROUP] Inserted student_status if missing (no update)", {
          studentNumber,
          active_curriculum: curriculumId,
          year_level_id: yearLevelId,
          active_school_year_id: activeSchoolYearId,
          enrolled_status: 1,
        });

        for (const payload of rowsToInsert) {
          await connection.query(
            `INSERT INTO enrolled_subject
              (student_number, curriculum_id, course_id, active_school_year_id, midterm, finals, final_grade, en_remarks, department_section_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
              payload.studentNumber,
              payload.curriculumId,
              payload.courseId,
              payload.activeSchoolYearId,
              payload.midterm,
              payload.finals,
              payload.finalGrade,
              payload.enRemarks,
              payload.departmentSectionId,
            ],
          );

          console.log("[IMPORT][ROW] Inserted enrolled_subject", {
            studentNumber: payload.studentNumber,
            curriculumId: payload.curriculumId,
            courseId: payload.courseId,
            activeSchoolYearId: payload.activeSchoolYearId,
            departmentSectionId: payload.departmentSectionId,
          });

          insertedSubjects += 1;
        }

        processedStudents += 1;
        console.log("[IMPORT][GROUP] Finished group", {
          studentNumber,
          processedStudents,
          insertedSubjects,
          skippedCount: skippedItems.length,
        });
      }

      await connection.commit();
      console.log("[IMPORT] Transaction committed", {
        groupedRecords: groupedMap.size,
        processedStudents,
        createdPersons,
        insertedSubjects,
        updatedSubjects,
        skippedCount: skippedItems.length,
      });
    } catch (transactionErr) {
      await connection.rollback();
      console.log("[IMPORT] Transaction rolled back", {
        message: transactionErr.message,
      });
      throw transactionErr;
    } finally {
      connection.release();
      console.log("[IMPORT] Connection released");
    }

    res.json({
      success: true,
      message: "Excel imported successfully",
      groupedRecords: groupedMap.size,
      processedStudents,
      createdPersons,
      insertedSubjects,
      updatedSubjects,
      skippedCount: skippedItems.length,
      skippedItems: skippedItems.slice(0, 50),
    });
  } catch (err) {
    console.error("Excel import error:", err);
    res.status(500).json({ error: "Failed to import Excel" });
  }
});

module.exports = router;
