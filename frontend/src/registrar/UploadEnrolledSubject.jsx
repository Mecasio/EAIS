import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Box} from '@mui/material';
import API_BASE_URL from '../apiConfig';

const UploadEnrolledSubject = () => {
    const [activeSchoolYear, setActiveSchoolYear] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [semester, setSemester] = useState([])
    const [selectedSchoolYear, setSelectedSchoolYear] = useState("");
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState("");
    const [studentUploaded, setStudentUploaded] = useState([]);

    useEffect(() => {
        fetchUploadedStudent();
    }, [])

    const fetchUploadedStudent = async () => {
        try{
            const res = await axios.query(`${API_BASE_URL}/get_uploaded_students`);
            setStudentUploaded(res.data);
        } catch (err) {
            console.error("Failed in Fetching: ", err);
        }
    }

    const handleImportXlsx = () => {
        
    };

    return (
        <Box>

        </Box>
    )
}

export default UploadEnrolledSubject;