-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 18, 2026 at 07:58 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `admission`
--

-- --------------------------------------------------------

--
-- Table structure for table `admission_exam`
--

CREATE TABLE `admission_exam` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `English` int(11) DEFAULT NULL,
  `Science` int(11) DEFAULT NULL,
  `Filipino` int(11) DEFAULT NULL,
  `Math` int(11) DEFAULT NULL,
  `Abstract` int(11) DEFAULT NULL,
  `final_rating` int(11) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `date_created` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `valid_days` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp GENERATED ALWAYS AS (`created_at` + interval `valid_days` day) STORED,
  `target_role` enum('student','faculty','applicant') NOT NULL,
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `applicant_numbering_table`
--

CREATE TABLE `applicant_numbering_table` (
  `applicant_number` varchar(20) NOT NULL,
  `person_id` int(11) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `applied_programs`
--

CREATE TABLE `applied_programs` (
  `applied_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `curriculum_id` int(11) NOT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company_settings`
--

CREATE TABLE `company_settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `short_term` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `header_color` varchar(20) DEFAULT '#ffffff',
  `footer_text` text DEFAULT NULL,
  `footer_color` varchar(20) DEFAULT '#ffffff',
  `logo_url` varchar(255) DEFAULT NULL,
  `bg_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `main_button_color` varchar(20) DEFAULT '#ffffff',
  `sub_button_color` varchar(255) NOT NULL DEFAULT '#ffffff',
  `border_color` varchar(20) DEFAULT '#000000',
  `stepper_color` varchar(20) DEFAULT '#000000',
  `sidebar_button_color` varchar(20) DEFAULT '#000000',
  `title_color` varchar(20) DEFAULT '#000000',
  `subtitle_color` varchar(20) DEFAULT '#555555'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_settings`
--

INSERT INTO `company_settings` (`id`, `company_name`, `short_term`, `address`, `header_color`, `footer_text`, `footer_color`, `logo_url`, `bg_image`, `created_at`, `updated_at`, `main_button_color`, `sub_button_color`, `border_color`, `stepper_color`, `sidebar_button_color`, `title_color`, `subtitle_color`) VALUES
(1, 'Eulogio \"Amang\" Rodriguez Institute of Science and Technology ', 'EARIST', 'Nagtahan St. Sampaloc, Manila', '#9e0000', '  © 2025 Eulogio \"Amang\" Rodriguez Institute of Science and Technology - Manila Campus', '#9e0000', '/uploads/Logo.png', '/uploads/Background.png', '2025-10-15 01:27:38', '2026-01-23 07:57:14', '#9e0000', '#ffebcd', '#000000', '#000000', '#000000', '#9e0000', '#c13333');

-- --------------------------------------------------------

--
-- Table structure for table `email_templates`
--

CREATE TABLE `email_templates` (
  `template_id` int(11) NOT NULL,
  `sender_name` varchar(255) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `entrance_exam_schedule`
--

CREATE TABLE `entrance_exam_schedule` (
  `schedule_id` int(11) NOT NULL,
  `day_description` varchar(20) NOT NULL,
  `building_description` varchar(255) DEFAULT NULL,
  `room_description` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `proctor` varchar(150) DEFAULT NULL,
  `active_school_year_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `room_quota` int(11) DEFAULT 40
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_applicants`
--

CREATE TABLE `exam_applicants` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `applicant_id` varchar(13) NOT NULL,
  `email_sent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `faculty_evaluation_table`
--

CREATE TABLE `faculty_evaluation_table` (
  `eval_id` int(11) NOT NULL,
  `prof_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `curriculum_id` int(11) NOT NULL,
  `active_school_year_id` int(11) NOT NULL,
  `num1` int(11) DEFAULT 0,
  `num2` int(11) DEFAULT 0,
  `num3` int(11) DEFAULT 0,
  `eval_status` tinyint(4) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interview_applicants`
--

CREATE TABLE `interview_applicants` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT 0,
  `applicant_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '0000000000',
  `email_sent` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) DEFAULT 'Waiting List',
  `action` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interview_exam_schedule`
--

CREATE TABLE `interview_exam_schedule` (
  `schedule_id` int(11) NOT NULL,
  `day_description` varchar(20) NOT NULL,
  `building_description` varchar(50) NOT NULL,
  `room_description` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `interviewer` varchar(150) DEFAULT NULL,
  `active_school_year_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `room_quota` int(11) DEFAULT 40
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `medical_requirements`
--

CREATE TABLE `medical_requirements` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `applicant_number` varchar(50) DEFAULT NULL,
  `age_onset` varchar(50) DEFAULT NULL,
  `genital_enlargement` varchar(50) DEFAULT NULL,
  `pubic_hair` varchar(50) DEFAULT NULL,
  `height` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `bmi` varchar(50) DEFAULT NULL,
  `interpretation` varchar(100) DEFAULT NULL,
  `heart_rate` varchar(50) DEFAULT NULL,
  `respiratory_rate` varchar(50) DEFAULT NULL,
  `o2_saturation` varchar(50) DEFAULT NULL,
  `blood_pressure` varchar(50) DEFAULT NULL,
  `vision_acuity` varchar(100) DEFAULT NULL,
  `general_survey` varchar(255) DEFAULT NULL,
  `skin` varchar(255) DEFAULT NULL,
  `eyes` varchar(255) DEFAULT NULL,
  `ent` varchar(255) DEFAULT NULL,
  `neck` varchar(255) DEFAULT NULL,
  `heart` varchar(255) DEFAULT NULL,
  `chest_lungs` varchar(255) DEFAULT NULL,
  `abdomen` varchar(255) DEFAULT NULL,
  `musculoskeletal` varchar(255) DEFAULT NULL,
  `breast_exam` varchar(255) DEFAULT NULL,
  `genitalia_smr` varchar(255) DEFAULT NULL,
  `penis` varchar(255) DEFAULT NULL,
  `dental_general_condition` varchar(100) DEFAULT NULL,
  `dental_good_hygiene` tinyint(1) DEFAULT 0,
  `dental_presence_of_calculus_plaque` tinyint(1) DEFAULT 0,
  `dental_gingivitis` tinyint(1) DEFAULT 0,
  `dental_denture_wearer_up` tinyint(1) DEFAULT 0,
  `dental_denture_wearer_down` tinyint(1) DEFAULT 0,
  `dental_with_braces_up` tinyint(1) DEFAULT 0,
  `dental_with_braces_down` tinyint(1) DEFAULT 0,
  `dental_with_oral_hygiene_reliner` tinyint(1) DEFAULT 0,
  `dental_diabetes` tinyint(1) DEFAULT 0,
  `dental_hypertension` tinyint(1) DEFAULT 0,
  `dental_allergies` tinyint(1) DEFAULT 0,
  `dental_heart_disease` tinyint(1) DEFAULT 0,
  `dental_epilepsy` tinyint(1) DEFAULT 0,
  `dental_mental_illness` tinyint(1) DEFAULT 0,
  `dental_clotting_disorder` tinyint(1) DEFAULT 0,
  `dental_upper_right` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_upper_right`)),
  `dental_upper_left` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_upper_left`)),
  `dental_lower_right` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_lower_right`)),
  `dental_lower_left` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`dental_lower_left`)),
  `pne_mental_status_check` tinyint(1) DEFAULT 0,
  `pne_mental_status_text` varchar(255) DEFAULT NULL,
  `pne_sensory_check` tinyint(1) DEFAULT 0,
  `pne_sensory_text` varchar(255) DEFAULT NULL,
  `pne_cranial_nerve_check` tinyint(1) DEFAULT 0,
  `pne_cranial_nerve_text` varchar(255) DEFAULT NULL,
  `pne_cerebellar_check` tinyint(1) DEFAULT 0,
  `pne_cerebellar_text` varchar(255) DEFAULT NULL,
  `pne_motor_check` tinyint(1) DEFAULT 0,
  `pne_motor_text` varchar(255) DEFAULT NULL,
  `pne_reflexes_check` tinyint(1) DEFAULT 0,
  `pne_reflexes_text` varchar(255) DEFAULT NULL,
  `pne_findings_psychological` text DEFAULT NULL,
  `pne_recommendations` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(20) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `applicant_number` varchar(20) DEFAULT NULL,
  `actor_email` varchar(100) DEFAULT NULL,
  `actor_name` varchar(255) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `person_status_table`
--

CREATE TABLE `person_status_table` (
  `id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `applicant_id` bigint(20) NOT NULL,
  `exam_status` tinyint(4) DEFAULT 0,
  `interview_status` int(11) DEFAULT 0,
  `requirements` tinyint(4) DEFAULT 0,
  `residency` tinyint(4) DEFAULT 0,
  `student_registration_status` tinyint(4) DEFAULT 0,
  `exam_result` decimal(11,0) DEFAULT 0,
  `hs_ave` int(11) DEFAULT 0,
  `qualifying_result` int(11) DEFAULT 0,
  `interview_result` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `person_table`
--

CREATE TABLE `person_table` (
  `person_id` int(11) NOT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `campus` int(11) DEFAULT NULL,
  `academicProgram` varchar(100) DEFAULT NULL,
  `classifiedAs` varchar(50) DEFAULT NULL,
  `applyingAs` varchar(100) DEFAULT NULL,
  `program` varchar(100) DEFAULT NULL,
  `program2` varchar(100) DEFAULT NULL,
  `program3` varchar(100) DEFAULT NULL,
  `yearLevel` varchar(30) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `extension` varchar(10) DEFAULT NULL,
  `nickname` varchar(50) DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `weight` varchar(10) DEFAULT NULL,
  `lrnNumber` varchar(20) DEFAULT NULL,
  `nolrnNumber` int(5) DEFAULT NULL,
  `gender` int(11) DEFAULT NULL,
  `pwdMember` int(5) DEFAULT NULL,
  `pwdType` varchar(50) DEFAULT NULL,
  `pwdId` varchar(50) DEFAULT NULL,
  `birthOfDate` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `birthPlace` varchar(255) DEFAULT NULL,
  `languageDialectSpoken` varchar(255) DEFAULT NULL,
  `citizenship` varchar(50) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `civilStatus` varchar(50) DEFAULT NULL,
  `tribeEthnicGroup` varchar(50) DEFAULT NULL,
  `cellphoneNumber` varchar(20) DEFAULT NULL,
  `emailAddress` varchar(100) DEFAULT NULL,
  `presentStreet` varchar(255) DEFAULT NULL,
  `presentBarangay` varchar(100) DEFAULT NULL,
  `presentZipCode` varchar(10) DEFAULT NULL,
  `presentRegion` varchar(100) DEFAULT NULL,
  `presentProvince` varchar(100) DEFAULT NULL,
  `presentMunicipality` varchar(100) DEFAULT NULL,
  `presentDswdHouseholdNumber` varchar(50) DEFAULT NULL,
  `sameAsPresentAddress` int(5) DEFAULT NULL,
  `permanentStreet` varchar(255) DEFAULT NULL,
  `permanentBarangay` varchar(100) DEFAULT NULL,
  `permanentZipCode` varchar(10) DEFAULT NULL,
  `permanentRegion` varchar(75) DEFAULT NULL,
  `permanentProvince` varchar(75) DEFAULT NULL,
  `permanentMunicipality` varchar(75) DEFAULT NULL,
  `permanentDswdHouseholdNumber` varchar(50) DEFAULT NULL,
  `solo_parent` int(5) DEFAULT NULL,
  `father_deceased` int(5) DEFAULT NULL,
  `father_family_name` varchar(100) DEFAULT NULL,
  `father_given_name` varchar(100) DEFAULT NULL,
  `father_middle_name` varchar(100) DEFAULT NULL,
  `father_ext` varchar(10) DEFAULT NULL,
  `father_nickname` varchar(50) DEFAULT NULL,
  `father_education` int(5) NOT NULL,
  `father_education_level` varchar(100) DEFAULT NULL,
  `father_last_school` varchar(100) DEFAULT NULL,
  `father_course` varchar(100) DEFAULT NULL,
  `father_year_graduated` varchar(10) DEFAULT NULL,
  `father_school_address` varchar(255) DEFAULT NULL,
  `father_contact` varchar(20) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `father_employer` varchar(100) DEFAULT NULL,
  `father_income` varchar(20) DEFAULT NULL,
  `father_email` varchar(100) DEFAULT NULL,
  `mother_deceased` int(5) DEFAULT NULL,
  `mother_family_name` varchar(100) DEFAULT NULL,
  `mother_given_name` varchar(100) DEFAULT NULL,
  `mother_middle_name` varchar(100) DEFAULT NULL,
  `mother_ext` varchar(10) DEFAULT NULL,
  `mother_nickname` varchar(50) DEFAULT NULL,
  `mother_education` int(5) NOT NULL,
  `mother_education_level` varchar(100) DEFAULT NULL,
  `mother_last_school` varchar(100) DEFAULT NULL,
  `mother_course` varchar(100) DEFAULT NULL,
  `mother_year_graduated` varchar(10) DEFAULT NULL,
  `mother_school_address` varchar(255) DEFAULT NULL,
  `mother_contact` varchar(20) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `mother_employer` varchar(100) DEFAULT NULL,
  `mother_income` varchar(20) DEFAULT NULL,
  `mother_email` varchar(100) DEFAULT NULL,
  `guardian` varchar(100) DEFAULT NULL,
  `guardian_family_name` varchar(100) DEFAULT NULL,
  `guardian_given_name` varchar(100) DEFAULT NULL,
  `guardian_middle_name` varchar(100) DEFAULT NULL,
  `guardian_ext` varchar(20) DEFAULT NULL,
  `guardian_nickname` varchar(50) DEFAULT NULL,
  `guardian_address` varchar(255) DEFAULT NULL,
  `guardian_contact` varchar(20) DEFAULT NULL,
  `guardian_email` varchar(100) DEFAULT NULL,
  `annual_income` varchar(50) DEFAULT NULL,
  `schoolLevel` varchar(50) DEFAULT NULL,
  `schoolLastAttended` varchar(100) DEFAULT NULL,
  `schoolAddress` varchar(255) DEFAULT NULL,
  `courseProgram` varchar(100) DEFAULT NULL,
  `honor` varchar(100) DEFAULT NULL,
  `generalAverage` decimal(5,2) DEFAULT NULL,
  `yearGraduated` int(11) DEFAULT NULL,
  `schoolLevel1` varchar(50) DEFAULT NULL,
  `schoolLastAttended1` varchar(100) DEFAULT NULL,
  `schoolAddress1` varchar(255) DEFAULT NULL,
  `courseProgram1` varchar(100) DEFAULT NULL,
  `honor1` varchar(100) DEFAULT NULL,
  `generalAverage1` decimal(5,2) DEFAULT NULL,
  `yearGraduated1` int(11) DEFAULT NULL,
  `strand` varchar(100) DEFAULT NULL,
  `cough` int(11) DEFAULT NULL,
  `colds` int(11) DEFAULT NULL,
  `fever` int(11) DEFAULT NULL,
  `asthma` int(11) DEFAULT NULL,
  `faintingSpells` int(11) DEFAULT NULL,
  `heartDisease` int(11) DEFAULT NULL,
  `tuberculosis` int(11) DEFAULT NULL,
  `frequentHeadaches` int(11) DEFAULT NULL,
  `hernia` int(11) DEFAULT NULL,
  `chronicCough` int(11) DEFAULT NULL,
  `headNeckInjury` int(11) DEFAULT NULL,
  `hiv` int(11) DEFAULT NULL,
  `highBloodPressure` int(11) DEFAULT NULL,
  `diabetesMellitus` int(11) DEFAULT NULL,
  `allergies` int(11) DEFAULT NULL,
  `cancer` int(11) DEFAULT NULL,
  `smokingCigarette` int(11) DEFAULT NULL,
  `alcoholDrinking` int(11) DEFAULT NULL,
  `hospitalized` int(11) DEFAULT NULL,
  `hospitalizationDetails` varchar(255) DEFAULT NULL,
  `medications` varchar(255) DEFAULT NULL,
  `hadCovid` int(11) DEFAULT NULL,
  `covidDate` varchar(50) DEFAULT NULL,
  `vaccine1Brand` varchar(50) DEFAULT NULL,
  `vaccine1Date` varchar(50) DEFAULT NULL,
  `vaccine2Brand` varchar(50) DEFAULT NULL,
  `vaccine2Date` varchar(50) DEFAULT NULL,
  `booster1Brand` varchar(50) DEFAULT NULL,
  `booster1Date` varchar(50) DEFAULT NULL,
  `booster2Brand` varchar(50) DEFAULT NULL,
  `booster2Date` varchar(50) DEFAULT NULL,
  `chestXray` varchar(100) DEFAULT NULL,
  `cbc` varchar(100) DEFAULT NULL,
  `urinalysis` varchar(100) DEFAULT NULL,
  `otherworkups` varchar(255) DEFAULT NULL,
  `symptomsToday` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `termsOfAgreement` int(10) DEFAULT NULL,
  `created_at` date NOT NULL DEFAULT current_timestamp(),
  `current_step` int(11) DEFAULT 1
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=COMPRESSED;

-- --------------------------------------------------------

--
-- Table structure for table `program_slots`
--

CREATE TABLE `program_slots` (
  `slot_id` int(11) NOT NULL,
  `curriculum_id` int(11) NOT NULL,
  `max_slots` int(11) NOT NULL,
  `active_school_year_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requirements_table`
--

CREATE TABLE `requirements_table` (
  `id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `short_label` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'Regular',
  `is_verifiable` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `requirement_uploads`
--

CREATE TABLE `requirement_uploads` (
  `upload_id` int(11) NOT NULL,
  `requirements_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `submitted_documents` int(11) DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `original_name` varchar(100) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `document_status` varchar(255) DEFAULT NULL,
  `missing_documents` varchar(255) DEFAULT NULL,
  `registrar_status` int(11) DEFAULT NULL,
  `submitted_medical` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_updated_by` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signature_table`
--

CREATE TABLE `signature_table` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `signature_image` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_accounts`
--

CREATE TABLE `user_accounts` (
  `user_id` int(11) NOT NULL,
  `person_id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'applicant',
  `status` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verify_applicants`
--

CREATE TABLE `verify_applicants` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) DEFAULT NULL,
  `applicant_id` varchar(13) NOT NULL,
  `email_sent` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verify_document_schedule`
--

CREATE TABLE `verify_document_schedule` (
  `schedule_id` int(11) NOT NULL,
  `schedule_date` varchar(255) NOT NULL,
  `building_description` varchar(150) NOT NULL,
  `room_description` varchar(150) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `evaluator` varchar(150) DEFAULT NULL,
  `room_quota` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admission_exam`
--
ALTER TABLE `admission_exam`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_person` (`person_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `applicant_numbering_table`
--
ALTER TABLE `applicant_numbering_table`
  ADD PRIMARY KEY (`applicant_number`),
  ADD UNIQUE KEY `person_id` (`person_id`);

--
-- Indexes for table `applied_programs`
--
ALTER TABLE `applied_programs`
  ADD PRIMARY KEY (`applied_id`);

--
-- Indexes for table `company_settings`
--
ALTER TABLE `company_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`template_id`);

--
-- Indexes for table `entrance_exam_schedule`
--
ALTER TABLE `entrance_exam_schedule`
  ADD PRIMARY KEY (`schedule_id`);

--
-- Indexes for table `exam_applicants`
--
ALTER TABLE `exam_applicants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `faculty_evaluation_table`
--
ALTER TABLE `faculty_evaluation_table`
  ADD PRIMARY KEY (`eval_id`);

--
-- Indexes for table `interview_applicants`
--
ALTER TABLE `interview_applicants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `interview_exam_schedule`
--
ALTER TABLE `interview_exam_schedule`
  ADD PRIMARY KEY (`schedule_id`);

--
-- Indexes for table `medical_requirements`
--
ALTER TABLE `medical_requirements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `person_status_table`
--
ALTER TABLE `person_status_table`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_person_id` (`person_id`);

--
-- Indexes for table `person_table`
--
ALTER TABLE `person_table`
  ADD PRIMARY KEY (`person_id`);

--
-- Indexes for table `program_slots`
--
ALTER TABLE `program_slots`
  ADD PRIMARY KEY (`slot_id`);

--
-- Indexes for table `requirements_table`
--
ALTER TABLE `requirements_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `requirement_uploads`
--
ALTER TABLE `requirement_uploads`
  ADD PRIMARY KEY (`upload_id`);

--
-- Indexes for table `signature_table`
--
ALTER TABLE `signature_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_accounts`
--
ALTER TABLE `user_accounts`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `person_id` (`person_id`);

--
-- Indexes for table `verify_applicants`
--
ALTER TABLE `verify_applicants`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `verify_document_schedule`
--
ALTER TABLE `verify_document_schedule`
  ADD PRIMARY KEY (`schedule_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admission_exam`
--
ALTER TABLE `admission_exam`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `applied_programs`
--
ALTER TABLE `applied_programs`
  MODIFY `applied_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company_settings`
--
ALTER TABLE `company_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `entrance_exam_schedule`
--
ALTER TABLE `entrance_exam_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_applicants`
--
ALTER TABLE `exam_applicants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty_evaluation_table`
--
ALTER TABLE `faculty_evaluation_table`
  MODIFY `eval_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_applicants`
--
ALTER TABLE `interview_applicants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interview_exam_schedule`
--
ALTER TABLE `interview_exam_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `medical_requirements`
--
ALTER TABLE `medical_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `person_status_table`
--
ALTER TABLE `person_status_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `person_table`
--
ALTER TABLE `person_table`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `program_slots`
--
ALTER TABLE `program_slots`
  MODIFY `slot_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requirements_table`
--
ALTER TABLE `requirements_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `requirement_uploads`
--
ALTER TABLE `requirement_uploads`
  MODIFY `upload_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `signature_table`
--
ALTER TABLE `signature_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_accounts`
--
ALTER TABLE `user_accounts`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verify_applicants`
--
ALTER TABLE `verify_applicants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verify_document_schedule`
--
ALTER TABLE `verify_document_schedule`
  MODIFY `schedule_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
