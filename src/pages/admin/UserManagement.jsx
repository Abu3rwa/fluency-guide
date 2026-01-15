import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Avatar,
    Card,
    CardContent,
    Grid,
    Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

function AdminUserManagement() {
    const { t, i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    // State
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Edit dialog state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        students: 0,
        instructors: 0,
        admins: 0,
    });

    // Check admin access
    useEffect(() => {
        if (userProfile && !userProfile.isAdmin) {
            navigate('/');
        }
    }, [userProfile, navigate]);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filter users when search or filter changes
    useEffect(() => {
        filterUsers();
    }, [users, searchQuery, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const usersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || null,
            }));

            setUsers(usersList);

            // Calculate stats
            const statsData = {
                total: usersList.length,
                students: usersList.filter(u => u.role === 'student').length,
                instructors: usersList.filter(u => u.role === 'instructor').length,
                admins: usersList.filter(u => u.isAdmin).length,
            };
            setStats(statsData);

        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage({ type: 'error', text: isArabic ? 'خطأ في تحميل المستخدمين' : 'Error loading users' });
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = [...users];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query) ||
                user.uid?.toLowerCase().includes(query)
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            if (roleFilter === 'admin') {
                filtered = filtered.filter(user => user.isAdmin);
            } else {
                filtered = filtered.filter(user => user.role === roleFilter);
            }
        }

        setFilteredUsers(filtered);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setNewRole(user.role || 'student');
        setEditDialogOpen(true);
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;

        setUpdating(true);
        try {
            const userRef = doc(db, 'users', selectedUser.id);
            await updateDoc(userRef, {
                role: newRole,
                updatedAt: Timestamp.now(),
            });

            // Update local state
            setUsers(prev => prev.map(u =>
                u.id === selectedUser.id ? { ...u, role: newRole, updatedAt: new Date() } : u
            ));

            setMessage({
                type: 'success',
                text: isArabic ? 'تم تحديث دور المستخدم بنجاح' : 'User role updated successfully'
            });
            setEditDialogOpen(false);

            // Recalculate stats
            const updatedUsers = users.map(u =>
                u.id === selectedUser.id ? { ...u, role: newRole } : u
            );
            setStats({
                total: updatedUsers.length,
                students: updatedUsers.filter(u => u.role === 'student').length,
                instructors: updatedUsers.filter(u => u.role === 'instructor').length,
                admins: updatedUsers.filter(u => u.isAdmin).length,
            });

        } catch (error) {
            console.error('Error updating user:', error);
            setMessage({
                type: 'error',
                text: isArabic ? 'خطأ في تحديث دور المستخدم' : 'Error updating user role'
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const getRoleIcon = (role, isAdmin) => {
        if (isAdmin) return <AdminPanelSettingsIcon sx={{ color: '#9c27b0' }} />;
        if (role === 'instructor') return <SchoolIcon sx={{ color: '#00897B' }} />;
        return <PersonIcon sx={{ color: '#1976d2' }} />;
    };

    const getRoleChip = (role, isAdmin) => {
        if (isAdmin) {
            return (
                <Chip
                    label={isArabic ? 'مدير' : 'Admin'}
                    size="small"
                    sx={{
                        bgcolor: '#9c27b0',
                        color: 'white',
                        fontWeight: 600,
                    }}
                />
            );
        }
        if (role === 'instructor') {
            return (
                <Chip
                    label={isArabic ? 'مدرس' : 'Instructor'}
                    size="small"
                    sx={{
                        bgcolor: '#00897B',
                        color: 'white',
                        fontWeight: 600,
                    }}
                />
            );
        }
        return (
            <Chip
                label={isArabic ? 'طالب' : 'Student'}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
            />
        );
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!userProfile?.isAdmin) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Alert severity="error">
                    {isArabic ? 'ليس لديك صلاحية الوصول لهذه الصفحة' : 'You do not have permission to access this page'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pb: 4 }}>
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)',
                    color: 'white',
                    py: 4,
                    px: 3,
                    mb: 4,
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                fontFamily: isArabic ? "'Tajawal', sans-serif" : "'Montserrat', sans-serif",
                            }}
                        >
                            {isArabic ? 'إدارة المستخدمين' : 'User Management'}
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {isArabic
                            ? 'إدارة حسابات المستخدمين وتحديث أدوارهم'
                            : 'Manage user accounts and update their roles'}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Message Alert */}
                {message.text && (
                    <Alert
                        severity={message.type}
                        sx={{ mb: 3 }}
                        onClose={() => setMessage({ type: '', text: '' })}
                    >
                        {message.text}
                    </Alert>
                )}

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'إجمالي المستخدمين' : 'Total Users'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)',
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <PersonIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.students}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'الطلاب' : 'Students'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <SchoolIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.instructors}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'المدرسين' : 'Instructors'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Card sx={{
                            background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                            color: 'white',
                        }}>
                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                <VerifiedUserIcon sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.admins}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {isArabic ? 'المديرين' : 'Admins'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                placeholder={isArabic ? 'البحث بالاسم أو البريد الإلكتروني...' : 'Search by name or email...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="small"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={8} md={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>{isArabic ? 'تصفية حسب الدور' : 'Filter by Role'}</InputLabel>
                                <Select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    label={isArabic ? 'تصفية حسب الدور' : 'Filter by Role'}
                                >
                                    <MenuItem value="all">{isArabic ? 'الكل' : 'All'}</MenuItem>
                                    <MenuItem value="student">{isArabic ? 'طلاب' : 'Students'}</MenuItem>
                                    <MenuItem value="instructor">{isArabic ? 'مدرسين' : 'Instructors'}</MenuItem>
                                    <MenuItem value="admin">{isArabic ? 'مديرين' : 'Admins'}</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={4} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchUsers}
                                disabled={loading}
                            >
                                {isArabic ? 'تحديث' : 'Refresh'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Users Table */}
                <Paper sx={{ overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.100' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'المستخدم' : 'User'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'البريد الإلكتروني' : 'Email'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'الدور' : 'Role'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'تاريخ التسجيل' : 'Registered'}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'آخر تحديث' : 'Last Updated'}
                                    </TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                                        {isArabic ? 'الإجراءات' : 'Actions'}
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <CircularProgress />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography color="textSecondary">
                                                {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((user) => (
                                            <TableRow key={user.id} hover>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: user.isAdmin ? '#9c27b0' : user.role === 'instructor' ? '#00897B' : '#1976d2' }}>
                                                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 500 }}>
                                                                {user.name || '-'}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                ID: {user.uid?.slice(0, 8)}...
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{user.email || '-'}</TableCell>
                                                <TableCell>{getRoleChip(user.role, user.isAdmin)}</TableCell>
                                                <TableCell>{formatDate(user.createdAt)}</TableCell>
                                                <TableCell>{formatDate(user.updatedAt)}</TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title={isArabic ? 'تعديل الدور' : 'Edit Role'}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleEditUser(user)}
                                                            disabled={user.isAdmin && user.id !== userProfile?.uid}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {/* Delete button placeholder - will be implemented with Firebase Functions */}
                                                    {/* <Tooltip title={isArabic ? 'حذف' : 'Delete'}>
                            <IconButton color="error" disabled>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip> */}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        labelRowsPerPage={isArabic ? 'عدد الصفوف:' : 'Rows per page:'}
                    />
                </Paper>
            </Container>

            {/* Edit Role Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    {isArabic ? 'تعديل دور المستخدم' : 'Edit User Role'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {selectedUser && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: '#00897B' }}>
                                    {selectedUser.name?.[0]?.toUpperCase() || '?'}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {selectedUser.name || 'Unknown'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {selectedUser.email}
                                    </Typography>
                                </Box>
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>{isArabic ? 'الدور' : 'Role'}</InputLabel>
                                <Select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value)}
                                    label={isArabic ? 'الدور' : 'Role'}
                                >
                                    <MenuItem value="student">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PersonIcon fontSize="small" />
                                            {isArabic ? 'طالب' : 'Student'}
                                        </Box>
                                    </MenuItem>
                                    <MenuItem value="instructor">
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SchoolIcon fontSize="small" />
                                            {isArabic ? 'مدرس' : 'Instructor'}
                                        </Box>
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Alert severity="info" sx={{ mt: 2 }}>
                                {isArabic
                                    ? 'ملاحظة: تغيير الدور إلى "مدرس" سيمنح المستخدم صلاحية إنشاء وإدارة الدورات.'
                                    : 'Note: Changing role to "Instructor" will grant the user permission to create and manage courses.'}
                            </Alert>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button onClick={() => setEditDialogOpen(false)} disabled={updating}>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateRole}
                        disabled={updating || newRole === selectedUser?.role}
                        startIcon={updating ? <CircularProgress size={16} /> : null}
                    >
                        {updating
                            ? (isArabic ? 'جاري التحديث...' : 'Updating...')
                            : (isArabic ? 'تحديث الدور' : 'Update Role')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AdminUserManagement;
