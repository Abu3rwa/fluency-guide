import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function PrivateLessons() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);

    // Students
    const [students, setStudents] = useState([]);
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [studentForm, setStudentForm] = useState({
        name: '',
        phone: '',
        hourlyRate: '',
        paymentSchedule: 'per_lesson',
    });

    // Lessons
    const [lessons, setLessons] = useState([]);
    const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonForm, setLessonForm] = useState({
        studentId: '',
        date: new Date().toISOString().split('T')[0],
        duration: '1',
        amount: '',
        notes: '',
    });

    // Payments
    const [payments, setPayments] = useState([]);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        studentId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    useEffect(() => {
        if (user?.uid) {
            fetchAllData();
        }
    }, [user?.uid]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchStudents(), fetchLessons(), fetchPayments()]);
        setLoading(false);
    };

    const fetchStudents = async () => {
        try {
            const studentsRef = collection(db, 'privateStudents');
            const q = query(studentsRef, where('instructorId', '==', user.uid));
            const snapshot = await getDocs(q);
            const studentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchLessons = async () => {
        try {
            const lessonsRef = collection(db, 'privateLessons');
            const q = query(
                lessonsRef,
                where('instructorId', '==', user.uid),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const lessonsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setLessons(lessonsData);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const paymentsRef = collection(db, 'privatePayments');
            const q = query(
                paymentsRef,
                where('instructorId', '==', user.uid),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            const paymentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setPayments(paymentsData);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    // Calculate student balance
    const getStudentBalance = (studentId) => {
        const totalOwed = lessons
            .filter(l => l.studentId === studentId)
            .reduce((sum, l) => sum + (l.amount || 0), 0);
        const totalPaid = payments
            .filter(p => p.studentId === studentId)
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        return { totalOwed, totalPaid, balance: totalOwed - totalPaid };
    };

    // Student handlers
    const handleOpenStudentDialog = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setStudentForm({
                name: student.name,
                phone: student.phone,
                hourlyRate: student.hourlyRate,
                paymentSchedule: student.paymentSchedule,
            });
        } else {
            setEditingStudent(null);
            setStudentForm({
                name: '',
                phone: '',
                hourlyRate: '',
                paymentSchedule: 'per_lesson',
            });
        }
        setStudentDialogOpen(true);
    };

    const handleSaveStudent = async () => {
        try {
            if (editingStudent) {
                await updateDoc(doc(db, 'privateStudents', editingStudent.id), {
                    ...studentForm,
                    hourlyRate: parseFloat(studentForm.hourlyRate),
                });
            } else {
                await addDoc(collection(db, 'privateStudents'), {
                    ...studentForm,
                    hourlyRate: parseFloat(studentForm.hourlyRate),
                    instructorId: user.uid,
                    createdAt: Timestamp.now(),
                });
            }
            setStudentDialogOpen(false);
            fetchStudents();
        } catch (error) {
            console.error('Error saving student:', error);
        }
    };

    const handleDeleteStudent = async (studentId) => {
        if (window.confirm(t('privateLessons.confirmDelete'))) {
            try {
                await deleteDoc(doc(db, 'privateStudents', studentId));
                fetchStudents();
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    };

    // Lesson handlers
    const handleOpenLessonDialog = (lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setLessonForm({
                studentId: lesson.studentId,
                date: lesson.date?.toDate ? lesson.date.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                duration: lesson.duration?.toString() || '1',
                amount: lesson.amount?.toString() || '',
                notes: lesson.notes || '',
            });
        } else {
            setEditingLesson(null);
            setLessonForm({
                studentId: '',
                date: new Date().toISOString().split('T')[0],
                duration: '1',
                amount: '',
                notes: '',
            });
        }
        setLessonDialogOpen(true);
    };

    const handleLessonStudentChange = (studentId) => {
        setLessonForm(prev => {
            const student = students.find(s => s.id === studentId);
            const duration = parseFloat(prev.duration) || 0;
            const amount = student ? (student.hourlyRate * duration).toFixed(2) : '';
            return { ...prev, studentId, amount };
        });
    };

    const handleLessonDurationChange = (duration) => {
        setLessonForm(prev => {
            const student = students.find(s => s.id === prev.studentId);
            const dur = parseFloat(duration) || 0;
            const amount = student ? (student.hourlyRate * dur).toFixed(2) : prev.amount;
            return { ...prev, duration, amount };
        });
    };

    const handleSaveLesson = async () => {
        try {
            const student = students.find(s => s.id === lessonForm.studentId);
            if (!student) {
                console.error('Student not found');
                alert(t('privateLessons.selectStudent'));
                return;
            }

            // Parse date properly
            let lessonDate;
            try {
                if (lessonForm.date && typeof lessonForm.date === 'string') {
                    lessonDate = new Date(lessonForm.date + 'T00:00:00');
                } else {
                    lessonDate = new Date();
                }
            } catch (e) {
                lessonDate = new Date();
            }

            const lessonData = {
                studentId: lessonForm.studentId,
                studentName: student.name,
                date: Timestamp.fromDate(lessonDate),
                duration: parseFloat(lessonForm.duration) || 0,
                amount: parseFloat(lessonForm.amount) || 0,
                notes: lessonForm.notes || '',
            };

            if (editingLesson && editingLesson.id) {
                const lessonRef = doc(db, 'privateLessons', String(editingLesson.id));
                await updateDoc(lessonRef, lessonData);
            } else {
                await addDoc(collection(db, 'privateLessons'), {
                    ...lessonData,
                    instructorId: user.uid,
                    createdAt: Timestamp.now(),
                });
            }
            setLessonDialogOpen(false);
            setEditingLesson(null);
            fetchLessons();
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert(t('privateLessons.errorSavingLesson'));
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm(t('privateLessons.confirmDeleteLesson'))) {
            try {
                await deleteDoc(doc(db, 'privateLessons', lessonId));
                fetchLessons();
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    // Payment handlers
    const handleOpenPaymentDialog = () => {
        setPaymentForm({
            studentId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: '',
        });
        setPaymentDialogOpen(true);
    };

    const handleSavePayment = async () => {
        try {
            const student = students.find(s => s.id === paymentForm.studentId);
            await addDoc(collection(db, 'privatePayments'), {
                instructorId: user.uid,
                studentId: paymentForm.studentId,
                studentName: student.name,
                amount: parseFloat(paymentForm.amount),
                date: Timestamp.fromDate(new Date(paymentForm.date)),
                notes: paymentForm.notes,
                createdAt: Timestamp.now(),
            });
            setPaymentDialogOpen(false);
            fetchPayments();
        } catch (error) {
            console.error('Error saving payment:', error);
        }
    };

    // Dashboard stats
    const getTotalHoursThisMonth = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return lessons
            .filter(l => l.date && l.date.toDate() >= startOfMonth)
            .reduce((sum, l) => sum + (l.duration || 0), 0);
    };

    const getTotalEarnedThisMonth = () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return lessons
            .filter(l => l.date && l.date.toDate() >= startOfMonth)
            .reduce((sum, l) => sum + (l.amount || 0), 0);
    };

    const getTotalOutstanding = () => {
        return students.reduce((sum, student) => {
            const { balance } = getStudentBalance(student.id);
            return sum + Math.max(0, balance);
        }, 0);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>


            {/* Dashboard Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <AccessTimeIcon sx={{ color: '#FFF', fontSize: 40 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {t('privateLessons.hoursThisMonth')}
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700 }}>
                                        {getTotalHoursThisMonth().toFixed(1)}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <SchoolIcon sx={{ color: '#FFF', fontSize: 40 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {t('privateLessons.earnedThisMonth')}
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700 }}>
                                        {getTotalEarnedThisMonth().toFixed(0)} SDG
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <PaymentIcon sx={{ color: '#FFF', fontSize: 40 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {t('privateLessons.outstanding')}
                                    </Typography>
                                    <Typography variant="h4" sx={{ color: '#FFF', fontWeight: 700 }}>
                                        {getTotalOutstanding().toFixed(0)} SDG
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                    <Tab label={t('privateLessons.students')} />
                    <Tab label={t('privateLessons.lessons')} />
                    <Tab label={t('privateLessons.payments')} />

                </Tabs>
            </Paper>

            {/* Students Tab */}
            {activeTab === 0 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{t('privateLessons.myStudents')}</Typography>
                        <Button
                            variant="contained"
                            startIcon={<PersonAddIcon />}
                            onClick={() => handleOpenStudentDialog()}
                        >
                            {t('privateLessons.addStudent')}
                        </Button>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('privateLessons.name')}</TableCell>
                                    <TableCell>{t('privateLessons.phone')}</TableCell>
                                    <TableCell>{t('privateLessons.ratePerHour')}</TableCell>
                                    <TableCell>{t('privateLessons.paymentSchedule')}</TableCell>
                                    <TableCell>{t('privateLessons.owed')}</TableCell>
                                    <TableCell>{t('privateLessons.paid')}</TableCell>
                                    <TableCell>{t('privateLessons.balance')}</TableCell>
                                    <TableCell>{t('privateLessons.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {students.map(student => {
                                    const { totalOwed, totalPaid, balance } = getStudentBalance(student.id);
                                    return (
                                        <TableRow key={student.id}>
                                            <TableCell>{student.name}</TableCell>
                                            <TableCell>{student.phone}</TableCell>
                                            <TableCell>{student.hourlyRate} SDG</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        student.paymentSchedule === 'per_lesson'
                                                            ? t('privateLessons.perLesson')
                                                            : student.paymentSchedule === 'weekly'
                                                                ? t('privateLessons.weekly')
                                                                : t('privateLessons.monthly')
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{totalOwed.toFixed(0)} SDG</TableCell>
                                            <TableCell>{totalPaid.toFixed(0)} SDG</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${balance.toFixed(0)} SDG`}
                                                    color={balance > 0 ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenStudentDialog(student)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteStudent(student.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Lessons Tab */}
            {activeTab === 1 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{t('privateLessons.lessons')}</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleOpenLessonDialog}
                            disabled={students.length === 0}
                        >
                            {t('privateLessons.logLesson')}
                        </Button>
                    </Box>
                    {students.length === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {t('privateLessons.addStudentsFirst')}
                        </Alert>
                    )}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('privateLessons.date')}</TableCell>
                                    <TableCell>{t('privateLessons.student')}</TableCell>
                                    <TableCell>{t('privateLessons.duration')}</TableCell>
                                    <TableCell>{t('privateLessons.amount')}</TableCell>
                                    <TableCell>{t('privateLessons.notes')}</TableCell>
                                    <TableCell>{t('privateLessons.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {lessons.map(lesson => (
                                    <TableRow key={lesson.id}>
                                        <TableCell>
                                            {lesson.date?.toDate().toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{lesson.studentName}</TableCell>
                                        <TableCell>{lesson.duration}</TableCell>
                                        <TableCell>{lesson.amount} SDG</TableCell>
                                        <TableCell>{lesson.notes}</TableCell>
                                        <TableCell>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenLessonDialog(lesson)}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Payments Tab */}
            {activeTab === 2 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{t('privateLessons.payments')}</Typography>
                        <Button
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={handleOpenPaymentDialog}
                            disabled={students.length === 0}
                        >
                            {t('privateLessons.recordPayment')}
                        </Button>
                    </Box>
                    {students.length === 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            {t('privateLessons.addStudentsFirst')}
                        </Alert>
                    )}
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('privateLessons.date')}</TableCell>
                                    <TableCell>{t('privateLessons.student')}</TableCell>
                                    <TableCell>{t('privateLessons.amount')}</TableCell>
                                    <TableCell>{t('privateLessons.balanceAfter')}</TableCell>
                                    <TableCell>{t('privateLessons.notes')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payments.map(payment => {
                                    const { balance } = getStudentBalance(payment.studentId);
                                    return (
                                        <TableRow key={payment.id}>
                                            <TableCell>
                                                {payment.date?.toDate().toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{payment.studentName}</TableCell>
                                            <TableCell>{payment.amount} SDG</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={`${balance.toFixed(0)} SDG`}
                                                    color={balance > 0 ? 'warning' : 'success'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{payment.notes}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Student Dialog */}
            <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingStudent
                        ? t('privateLessons.editStudent')
                        : t('privateLessons.addStudent')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label={t('privateLessons.name')}
                            value={studentForm.name}
                            onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={t('privateLessons.phone')}
                            value={studentForm.phone}
                            onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={t('privateLessons.hourlyRate')}
                            type="number"
                            value={studentForm.hourlyRate}
                            onChange={(e) => setStudentForm({ ...studentForm, hourlyRate: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>{t('privateLessons.paymentSchedule')}</InputLabel>
                            <Select
                                value={studentForm.paymentSchedule}
                                onChange={(e) => setStudentForm({ ...studentForm, paymentSchedule: e.target.value })}
                                label={t('privateLessons.paymentSchedule')}
                            >
                                <MenuItem value="per_lesson">{t('privateLessons.perLesson')}</MenuItem>
                                <MenuItem value="weekly">{t('privateLessons.weekly')}</MenuItem>
                                <MenuItem value="monthly">{t('privateLessons.monthly')}</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStudentDialogOpen(false)}>
                        {t('privateLessons.cancel')}
                    </Button>
                    <Button
                        onClick={handleSaveStudent}
                        variant="contained"
                        disabled={!studentForm.name || !studentForm.hourlyRate}
                    >
                        {t('privateLessons.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Lesson Dialog */}
            <Dialog open={lessonDialogOpen} onClose={() => { setLessonDialogOpen(false); setEditingLesson(null); }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingLesson
                        ? t('privateLessons.editLesson')
                        : t('privateLessons.logLesson')}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('privateLessons.student')}</InputLabel>
                            <Select
                                value={lessonForm.studentId}
                                onChange={(e) => handleLessonStudentChange(e.target.value)}
                                label={t('privateLessons.student')}
                            >
                                {students.map(student => {
                                    const { balance } = getStudentBalance(student.id);
                                    return (
                                        <MenuItem key={student.id} value={student.id}>
                                            {student.name} (Balance: {balance.toFixed(0)} SDG)
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <TextField
                            label={t('privateLessons.date')}
                            type="date"
                            value={lessonForm.date}
                            onChange={(e) => setLessonForm({ ...lessonForm, date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label={t('privateLessons.duration')}
                            type="number"
                            value={lessonForm.duration}
                            onChange={(e) => handleLessonDurationChange(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label={t('privateLessons.amount')}
                            type="number"
                            value={lessonForm.amount}
                            onChange={(e) => setLessonForm({ ...lessonForm, amount: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={t('privateLessons.notes')}
                            value={lessonForm.notes}
                            onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLessonDialogOpen(false)}>
                        {t('privateLessons.cancel')}
                    </Button>
                    <Button
                        onClick={handleSaveLesson}
                        variant="contained"
                        disabled={!lessonForm.studentId || !lessonForm.amount}
                    >
                        {t('privateLessons.save')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{t('privateLessons.recordPayment')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>{t('privateLessons.student')}</InputLabel>
                            <Select
                                value={paymentForm.studentId}
                                onChange={(e) => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                                label={t('privateLessons.student')}
                            >
                                {students.map(student => {
                                    const { balance } = getStudentBalance(student.id);
                                    return (
                                        <MenuItem key={student.id} value={student.id}>
                                            {student.name} (Owes: {balance.toFixed(0)} SDG)
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                        <TextField
                            label={t('privateLessons.amountPaid')}
                            type="number"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            fullWidth
                        />
                        {paymentForm.studentId && paymentForm.amount && (
                            <Alert severity="info">
                                <Typography variant="body2">
                                    {t('privateLessons.newBalance')}:
                                    <strong>
                                        {(getStudentBalance(paymentForm.studentId).balance - parseFloat(paymentForm.amount)).toFixed(0)} SDG
                                    </strong>
                                </Typography>
                            </Alert>
                        )}
                        <TextField
                            label={t('privateLessons.date')}
                            type="date"
                            value={paymentForm.date}
                            onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label={t('privateLessons.notes')}
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPaymentDialogOpen(false)}>
                        {t('privateLessons.cancel')}
                    </Button>
                    <Button
                        onClick={handleSavePayment}
                        variant="contained"
                        disabled={!paymentForm.studentId || !paymentForm.amount}
                    >
                        {t('privateLessons.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PrivateLessons;
