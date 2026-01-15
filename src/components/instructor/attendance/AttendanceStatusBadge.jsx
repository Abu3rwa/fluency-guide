import React from 'react';
import { Box, Typography, Chip, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';

function AttendanceStatusBadge({ status, size = 'small', showLabel = true }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'present':
                return {
                    label: 'Present',
                    arLabel: 'حاضر',
                    color: 'success',
                    icon: <CheckCircleIcon fontSize={size} />,
                };
            case 'absent':
                return {
                    label: 'Absent',
                    arLabel: 'غائب',
                    color: 'error',
                    icon: <CancelIcon fontSize={size} />,
                };
            case 'late':
                return {
                    label: 'Late',
                    arLabel: 'متأخر',
                    color: 'warning',
                    icon: <AccessTimeIcon fontSize={size} />,
                };
            default:
                return {
                    label: 'Not Marked',
                    arLabel: 'لم يتم التسجيل',
                    color: 'default',
                    icon: <PersonIcon fontSize={size} />,
                };
        }
    };

    const config = getStatusConfig();

    if (!showLabel) {
        return (
            <Tooltip title={config.label}>
                <Box sx={{ color: `${config.color}.main`, display: 'flex', alignItems: 'center' }}>
                    {config.icon}
                </Box>
            </Tooltip>
        );
    }

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            size={size}
            variant="outlined"
        />
    );
}

export default AttendanceStatusBadge;
