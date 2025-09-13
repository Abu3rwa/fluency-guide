import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const InstructorRoleManagement = ({ 
  instructors = [], 
  allUsers = [],
  onInstructorCreate = () => {},
  onInstructorUpdate = () => {},
  onInstructorDelete = () => {},
  onRoleChange = () => {}
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('instructor');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setRole('instructor');
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddInstructor = () => {
    if (selectedUser) {
      onRoleChange(selectedUser, role);
      handleCloseDialog();
    }
  };

  const handleDeleteInstructor = (userId) => {
    if (window.confirm('Are you sure you want to remove this user from instructor role?')) {
      onInstructorDelete(userId);
    }
  };

  // Filter users for search
  const filteredInstructors = instructors.filter(instructor => 
    instructor.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const nonInstructors = allUsers.filter(user => 
    !instructors.some(instructor => instructor.id === user.id) &&
    (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Instructor Management
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Add Instructor
        </Button>
      </Box>
      
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />
      
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
        Current Instructors ({filteredInstructors.length})
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInstructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell component="th" scope="row">
                  {instructor.displayName}
                </TableCell>
                <TableCell>{instructor.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={instructor.role} 
                    color={instructor.role === 'admin' ? 'error' : 'primary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  {instructor.instructorProfile ? 'Active' : 'Pending Setup'}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleDeleteInstructor(instructor.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredInstructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No instructors found. Add instructors to manage session bookings.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Available Users
      </Typography>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {nonInstructors.map((user) => (
              <TableRow key={user.id}>
                <TableCell component="th" scope="row">
                  {user.displayName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.role} 
                    color={user.role === 'admin' ? 'error' : 'secondary'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="right">
                  <Button 
                    variant="contained" 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      setSelectedUser(user.id);
                      setRole('instructor');
                      handleAddInstructor();
                    }}
                  >
                    Make Instructor
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            
            {nonInstructors.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users available to add as instructors.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Instructor</DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                value={role}
                label="Role"
                onChange={handleRoleChange}
              >
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="student">Student</MenuItem>
              </Select>
            </FormControl>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a role for the new instructor. Admins have full access to the system.
            </Typography>
            
            <Typography variant="subtitle2" gutterBottom>
              Select User:
            </Typography>
            
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {allUsers
                    .filter(user => !instructors.some(instructor => instructor.id === user.id))
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{user.displayName}</Typography>
                            <Chip 
                              label={user.role} 
                              color={user.role === 'admin' ? 'error' : 'secondary'} 
                              size="small" 
                            />
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell align="right">
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setSelectedUser(user.id);
                              handleAddInstructor();
                            }}
                          >
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InstructorRoleManagement;