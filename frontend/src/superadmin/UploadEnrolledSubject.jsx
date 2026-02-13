import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { SettingsContext } from "../App";
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Fade,
  Backdrop,
  LinearProgress,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import API_BASE_URL from '../apiConfig';
import LoadingOverlay from '../components/LoadingOverlay';
import Unauthorized from '../components/Unauthorized';

const PROGRESS_STEPS = [
  { key: 'sorting', label: 'Sorting XLSX data' },
  { key: 'processing', label: 'Processing grouped records' },
  { key: 'extracting', label: 'Extracting mapped values' },
  { key: 'saving', label: 'Saving to database' },
];

const UploadEnrolledSubject = () => {
    const settings = useContext(SettingsContext);
  
    const [titleColor, setTitleColor] = useState("#000000");
    const [subtitleColor, setSubtitleColor] = useState("#555555");
    const [borderColor, setBorderColor] = useState("#000000");
    const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
    const [subButtonColor, setSubButtonColor] = useState("#ffffff"); // ✅ NEW
    const [stepperColor, setStepperColor] = useState("#000000"); // ✅ NEW
  
    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [shortTerm, setShortTerm] = useState("");
    const [campusAddress, setCampusAddress] = useState("");
  
    // 🔹 Authentication and access states
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [employeeID, setEmployeeID] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
  
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [campus, setCampus] = useState('1');
    const [studentUploaded, setStudentUploaded] = useState([]);
    const [selectedProgramFilter, setSelectedProgramFilter] = useState("");
    const [selectedYearLevelFilter, setSelectedYearLevelFilter] = useState("");
    const [sortOption, setSortOption] = useState("upload_desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [importing, setImporting] = useState(false);

    const [progressOpen, setProgressOpen] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressStep, setProgressStep] = useState('sorting');
    const [progressMessage, setProgressMessage] = useState('Preparing import...');

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });
    const [skippedDialogOpen, setSkippedDialogOpen] = useState(false);
    const [skippedRows, setSkippedRows] = useState([]);

    const progressTimerRef = useRef(null);
    const fileInputRef = useRef(null);
    const pageId = 117;

    const programFilters = useMemo(() => {
        const map = new Map();
        studentUploaded.forEach((row) => {
            if (row.program_id && !map.has(row.program_id)) {
                map.set(row.program_id, {
                    program_id: row.program_id,
                    label: `(${row.program_code}) ${row.program_description}`,
                });
            }
        });
        return Array.from(map.values());
    }, [studentUploaded]);

    const yearLevelFilters = useMemo(() => {
        const map = new Map();
        studentUploaded.forEach((row) => {
            if (row.year_level_id && !map.has(row.year_level_id)) {
                map.set(row.year_level_id, {
                    year_level_id: row.year_level_id,
                    year_level_description: row.year_level_description,
                });
            }
        });
        return Array.from(map.values());
    }, [studentUploaded]);

    const filteredUploadedStudents = useMemo(() => {
        return studentUploaded.filter((row) => {
            const programOk =
                !selectedProgramFilter || String(row.program_id) === String(selectedProgramFilter);
            const yearLevelOk =
                !selectedYearLevelFilter ||
                String(row.year_level_id) === String(selectedYearLevelFilter);

            return programOk && yearLevelOk;
        });
    }, [studentUploaded, selectedProgramFilter, selectedYearLevelFilter]);

    const sortedUploadedStudents = useMemo(() => {
        const sorted = [...filteredUploadedStudents];
        if (sortOption === "lname_asc") {
            sorted.sort((a, b) =>
                String(a.last_name || "").localeCompare(String(b.last_name || ""), undefined, {
                    sensitivity: "base",
                }),
            );
        } else if (sortOption === "lname_desc") {
            sorted.sort((a, b) =>
                String(b.last_name || "").localeCompare(String(a.last_name || ""), undefined, {
                    sensitivity: "base",
                }),
            );
        } else {
            sorted.sort(
                (a, b) =>
                    new Date(b.uploaded_at || 0).getTime() - new Date(a.uploaded_at || 0).getTime(),
            );
        }
        return sorted;
    }, [filteredUploadedStudents, sortOption]);

    const itemsPerPage = 10;
    const totalPages = Math.max(1, Math.ceil(sortedUploadedStudents.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUploadedStudents = sortedUploadedStudents.slice(
        startIndex,
        startIndex + itemsPerPage,
    );
    
    useEffect(() => {
        if (!settings) return;

        // 🎨 Colors
        if (settings.title_color) setTitleColor(settings.title_color);
        if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
        if (settings.border_color) setBorderColor(settings.border_color);
        if (settings.main_button_color)
        setMainButtonColor(settings.main_button_color);
        if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color); // ✅ NEW
        if (settings.stepper_color) setStepperColor(settings.stepper_color); // ✅ NEW

        // 🏫 Logo
        if (settings.logo_url) {
        setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
        } else {
        setFetchedLogo(null);
        }

        // 🏷️ School Information
        if (settings.company_name) setCompanyName(settings.company_name);
        if (settings.short_term) setShortTerm(settings.short_term);
        if (settings.campus_address) setCampusAddress(settings.campus_address);
    }, [settings]);

    useEffect(() => {
        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");
        const storedEmployeeID = localStorage.getItem("employee_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);
            setEmployeeID(storedEmployeeID);

            if (storedRole === "registrar") {
                checkAccess(storedEmployeeID);
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    useEffect(() => {
        fetchUploadedStudent();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedProgramFilter, selectedYearLevelFilter, sortOption, studentUploaded.length]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (progressValue < 25) {
            setProgressStep('sorting');
            setProgressMessage('Sorting XLSX data...');
            return;
        }
        if (progressValue < 50) {
            setProgressStep('processing');
            setProgressMessage('Processing grouped student records...');
            return;
        }
        if (progressValue < 75) {
            setProgressStep('extracting');
            setProgressMessage('Extracting mapped fields and IDs...');
            return;
        }
        if (progressValue < 100) {
            setProgressStep('saving');
            setProgressMessage('Saving records to database...');
        }
    }, [progressValue]);

    const checkAccess = async (employeeID) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`,
            );
            if (response.data && response.data.page_privilege === 1) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error("Error checking access:", error);
            setHasAccess(false);
            if (error.response && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            setLoading(false);
        }
    };

    const fetchUploadedStudent = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/get_uploaded_students`);
            setStudentUploaded(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed in fetching uploaded students:', err);
        }
    };

    const startProgressTracking = () => {
        if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        }

        setProgressOpen(true);
        setProgressValue(8);
        setProgressStep('sorting');
        setProgressMessage('Sorting XLSX data...');

        progressTimerRef.current = setInterval(() => {
        setProgressValue((prev) => {
            const bump = Math.random() * 7 + 2;
            return Math.min(prev + bump, 95);
        });
        }, 450);
    };

    const finishProgressTracking = async (isSuccess) => {
        if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
        }

        setProgressValue(100);
        setProgressMessage(isSuccess ? 'Import completed successfully.' : 'Import failed.');

        await new Promise((resolve) => setTimeout(resolve, 800));
        setProgressOpen(false);
    };

    const getStepState = (stepKey) => {
        const currentIndex = PROGRESS_STEPS.findIndex((step) => step.key === progressStep);
        const targetIndex = PROGRESS_STEPS.findIndex((step) => step.key === stepKey);

        if (targetIndex < currentIndex) return 'done';
        if (targetIndex === currentIndex && progressValue < 100) return 'active';
        if (progressValue === 100) return 'done';
        return 'pending';
    };

    const handleImportXlsx = async () => {
        if (!selectedFile) {
        setSnackbar({
            open: true,
            message: 'Please choose an Excel file first.',
            severity: 'warning',
        });
        return;
        }

        try {
        setImporting(true);
        startProgressTracking();

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('campus', campus);

        const res = await axios.post(
            `${API_BASE_URL}/import-xlsx-into-enrolled-subject`,
            formData,
            {
            headers: { 'Content-Type': 'multipart/form-data' },
            },
        );

        if (res.data?.success) {
            await finishProgressTracking(true);
            const skippedCount = Number(res.data?.skippedCount || 0);
            const skippedItems = Array.isArray(res.data?.skippedItems) ? res.data.skippedItems : [];

            if (skippedCount > 0) {
                setSnackbar({
                    open: true,
                    message: `Import finished with ${skippedCount} skipped row(s).`,
                    severity: 'warning',
                });
                setSkippedRows(skippedItems);
                setSkippedDialogOpen(true);
            } else {
                setSnackbar({
                    open: true,
                    message: res.data.message || 'Excel imported successfully.',
                    severity: 'success',
                });
            }

            setSelectedFile(null);
            await fetchUploadedStudent();
        } else {
            await finishProgressTracking(false);
            setSnackbar({
            open: true,
            message: res.data?.error || 'Import failed.',
            severity: 'error',
            });
        }
        } catch (err) {
            console.error('Import failed:', err);
            await finishProgressTracking(false);
            setSnackbar({
                open: true,
                message: err.response?.data?.error || 'Import failed.',
                severity: 'error',
            });
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Loading..." />;
    }
        
    if (!hasAccess) {
        return <Unauthorized />;
    }

    return (
        <Box
        sx={{
            height: 'calc(100vh - 150px)',
            overflowY: 'auto',
            paddingRight: 1,
            backgroundColor: 'transparent',
            mt: 1,
            p: 2,
        }}
        >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight="bold" sx={{ color: titleColor }}>
            UPLOAD DATA PANEL
            </Typography>
        </Box>

        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
        <br />

        <TableContainer
            component={Paper}
            sx={{ width: "100%", border: `2px solid ${borderColor}` }}
        >
            <Table>
                <TableHead
                    sx={{ backgroundColor: settings?.header_color || "#1976d2" }}
                >
                    <TableRow>
                        <TableCell sx={{ color: "white", textAlign: "Center" }}>
                            Filter Uploaded Data
                        </TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>

        <Paper sx={{ p: 3, mb: 3, border: `2px solid ${borderColor}` }}>
            <Grid container spacing={2} justifyContent="flex-end">
                <Grid item xs={12} sm="auto">
                    <FormControl size="small" sx={{ width: 160 }}>
                        <Select
                            displayEmpty
                            value={selectedProgramFilter}
                            onChange={(e) => setSelectedProgramFilter(e.target.value)}
                        >
                            <MenuItem value="">All Programs</MenuItem>
                            {programFilters.map((program) => (
                                <MenuItem key={program.program_id} value={program.program_id}>
                                    {program.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12} sm="auto">
                    <FormControl size="small" sx={{ width: 160 }}>
                        <Select
                            displayEmpty
                            value={selectedYearLevelFilter}
                            onChange={(e) => setSelectedYearLevelFilter(e.target.value)}
                        >
                            <MenuItem value="">All Year Levels</MenuItem>
                            {yearLevelFilters.map((yl) => (
                                <MenuItem key={yl.year_level_id} value={yl.year_level_id}>
                                    {yl.year_level_description}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
        </Paper>

        <TableContainer
            component={Paper}
            sx={{ width: "100%", border: `2px solid ${borderColor}` }}
        >
            <Table>
                <TableHead
                    sx={{ backgroundColor: settings?.header_color || "#1976d2" }}
                >
                    <TableRow>
                        <TableCell sx={{ color: "white", textAlign: "Center" }}>
                            Import Student Data
                        </TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>

        <Paper sx={{ p: 3, mb: 3, border: `2px solid ${borderColor}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
                <Box>
                    <TextField
                        select
                        label="Campus"
                        size="small"
                        value={campus}
                        onChange={(e) => setCampus(e.target.value)}
                        SelectProps={{ native: true }}
                        sx={{ width: 160 }}
                    >
                        <option value="1">Manila</option>
                        <option value="2">Cavite</option>
                    </TextField>
                </Box>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    id="enrolled-subject-import"
                    style={{ display: 'none' }}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />

                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                    {selectedFile && (
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            {selectedFile.name}
                        </Typography>
                    )}

                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                                fileInputRef.current.click();
                            }
                        }}
                    >
                        Choose File
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleImportXlsx}
                        disabled={importing}
                        sx={{ backgroundColor: mainButtonColor, width: "150px" }}
                    >
                        {importing ? 'Importing...' : 'Import File'}
                    </Button>
                </Box>
            </Box>
        </Paper>

        <TableContainer component={Paper} sx={{ width: "100%", mb: 1 }}>
            <Table size="small">
                <TableHead
                    sx={{
                        backgroundColor: settings?.header_color || "#1976d2",
                        color: "white",
                    }}
                >
                    <TableRow>
                        <TableCell
                            colSpan={8}
                            sx={{
                                border: `2px solid ${borderColor}`,
                                py: 0.5,
                                backgroundColor: settings?.header_color || "#1976d2",
                                color: "white",
                            }}
                        >
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={1}
                            >
                                <Typography fontSize="14px" fontWeight="bold" color="white">
                                    Total Students: {sortedUploadedStudents.length}
                                </Typography>

                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                    <FormControl size="small" sx={{ minWidth: 190 }}>
                                        <Select
                                            value={sortOption}
                                            onChange={(e) => setSortOption(e.target.value)}
                                            sx={{
                                                fontSize: "12px",
                                                height: 36,
                                                color: "white",
                                                border: "1px solid white",
                                                backgroundColor: "transparent",
                                                ".MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "& svg": {
                                                    color: "white",
                                                },
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 250,
                                                        backgroundColor: "#fff",
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value="upload_desc">Upload Date (Newest)</MenuItem>
                                            <MenuItem value="lname_asc">Last Name (A-Z)</MenuItem>
                                            <MenuItem value="lname_desc">Last Name (Z-A)</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <Button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={currentPage === 1}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 80,
                                            color: "white",
                                            borderColor: "white",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                borderColor: "white",
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                            },
                                            "&.Mui-disabled": {
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        First
                                    </Button>

                                    <Button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 80,
                                            color: "white",
                                            borderColor: "white",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                borderColor: "white",
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                            },
                                            "&.Mui-disabled": {
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        Prev
                                    </Button>

                                    <FormControl size="small" sx={{ minWidth: 80 }}>
                                        <Select
                                            value={currentPage}
                                            onChange={(e) => setCurrentPage(Number(e.target.value))}
                                            displayEmpty
                                            sx={{
                                                fontSize: "12px",
                                                height: 36,
                                                color: "white",
                                                border: "1px solid white",
                                                backgroundColor: "transparent",
                                                ".MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "white",
                                                },
                                                "& svg": {
                                                    color: "white",
                                                },
                                            }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 200,
                                                        backgroundColor: "#fff",
                                                    },
                                                },
                                            }}
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <MenuItem key={i + 1} value={i + 1}>
                                                    Page {i + 1}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Typography fontSize="11px" color="white">
                                        of {totalPages} page{totalPages > 1 ? "s" : ""}
                                    </Typography>

                                    <Button
                                        onClick={() =>
                                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                        }
                                        disabled={currentPage === totalPages}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 80,
                                            color: "white",
                                            borderColor: "white",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                borderColor: "white",
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                            },
                                            "&.Mui-disabled": {
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        Next
                                    </Button>

                                    <Button
                                        onClick={() => setCurrentPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            minWidth: 80,
                                            color: "white",
                                            borderColor: "white",
                                            backgroundColor: "transparent",
                                            "&:hover": {
                                                borderColor: "white",
                                                backgroundColor: "rgba(255,255,255,0.1)",
                                            },
                                            "&.Mui-disabled": {
                                                color: "white",
                                                borderColor: "white",
                                                backgroundColor: "transparent",
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        Last
                                    </Button>
                                </Box>
                            </Box>
                        </TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>

        <TableContainer component={Paper} sx={{ border: `1px solid ${borderColor}` }}>
            <Table size="small">
            <TableHead>
                <TableRow>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1, textAlign: "center" }}>No.</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>Student Number</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>Last Name</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>First Name</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>Middle Name</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>Program</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>Program Code</TableCell>
                <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 , textAlign: "center"}}>Year Level</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {paginatedUploadedStudents.map((row, index) => (
                <TableRow key={`${row.student_number}-${index}`}>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1, textAlign: "center" }}>
                        {startIndex + index + 1}
                    </TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.student_number}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.last_name}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.first_name}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.middle_name}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.program_description}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 }}>{row.program_code}</TableCell>
                    <TableCell sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1 , textAlign: "center"}}>{row.year_level_description}</TableCell>
                </TableRow>
                ))}
                {filteredUploadedStudents.length === 0 && (
                <TableRow>
                    <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ borderColor: borderColor, borderStyle: "solid", borderWidth: 1, height: "120px" }}
                    >
                    No uploaded data yet.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>

        <Modal
            open={progressOpen}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{ backdrop: { timeout: 200 } }}
        >
            <Fade in={progressOpen}>
            <Box
                sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 520 },
                bgcolor: 'background.paper',
                border: '1px solid #d0d0d0',
                boxShadow: 24,
                borderRadius: 2,
                p: 3,
                }}
            >
                <Typography variant="h6" fontWeight="bold" mb={1}>
                Import Progress
                </Typography>
                <Typography variant="body2" mb={2}>
                {progressMessage}
                </Typography>

                <LinearProgress variant="determinate" value={progressValue} sx={{ height: 10, borderRadius: 2 }} />
                <Typography variant="caption" display="block" mt={1.5} mb={2}>
                {Math.round(progressValue)}%
                </Typography>

                {PROGRESS_STEPS.map((step) => {
                const state = getStepState(step.key);
                return (
                    <Typography
                    key={step.key}
                    variant="body2"
                    sx={{
                        mb: 0.75,
                        fontWeight: state === 'active' ? 700 : 400,
                        color: state === 'pending' ? 'text.secondary' : 'text.primary',
                    }}
                    >
                    [{state === 'done' ? 'DONE' : state === 'active' ? 'WORKING' : 'PENDING'}] {step.label}
                    </Typography>
                );
                })}
            </Box>
            </Fade>
        </Modal>

        <Dialog
            open={skippedDialogOpen}
            onClose={() => setSkippedDialogOpen(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Skipped Student Data</DialogTitle>
            <DialogContent dividers>
                {skippedRows.length === 0 ? (
                    <Typography variant="body2">No skipped rows details provided.</Typography>
                ) : (
                    <List dense>
                        {skippedRows.map((item, index) => (
                            <ListItem key={`${item.studentNumber || "NA"}-${index}`} sx={{ px: 0 }}>
                                <ListItemText
                                    primary={`${index + 1}. ${item.studentNumber || "Unknown Student"}`}
                                    secondary={item.reason || "No reason provided"}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSkippedDialogOpen(false)} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3500}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
            <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
            >
            {snackbar.message}
            </Alert>
        </Snackbar>
        </Box>
    );
};

export default UploadEnrolledSubject;
