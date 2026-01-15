import React from 'react';
import { TableRow, TableCell, Checkbox, TextField, IconButton, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttendanceStatusBadge from './AttendanceStatusBadge';

function StudentAttendanceRow({
    student,
    attendanceStatus,
    isSelected,
    note,
    onSelect,
    onNoteChange,
    onMarkAttendance,
    disabled = false,
}) {
    return (
        <TableRow hover>
            <TableCell padding="checkbox">
                <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelect(student.userId, e.target.checked)}
                    disabled={disabled || !!attendanceStatus}
                />
            </TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.email}</TableCell>
            <TableCell>
                <AttendanceStatusBadge status={attendanceStatus} />
            </TableCell>
            <TableCell>
                <TextField
                    size="small"
                    placeholder="Notes..."
                    value={note || ''}
                    onChange={(e) => onNoteChange(student.userId, e.target.value)}
                    disabled={!!attendanceStatus}
                    sx={{ width: 150 }}
                />
            </TableCell>
            <TableCell align="center">
                {!attendanceStatus && (
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton
                            size="small"
                            color="success"
                            onClick={() => onMarkAttendance(student.userId, 'present')}
                            title="Mark Present"
                        >
                            <CheckCircleIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onMarkAttendance(student.userId, 'absent')}
                            title="Mark Absent"
                        >
                            <CancelIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onMarkAttendance(student.userId, 'late')}
                            title="Mark Late"
                        >
                            <AccessTimeIcon fontSize="small" />
                        </IconButton>
                    </Box>
                )}
            </TableCell>
        </TableRow>
    );
}

export default StudentAttendanceRow;
