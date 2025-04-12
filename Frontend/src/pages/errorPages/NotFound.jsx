import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; 

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/dashboard'); // Navigate to the homepage
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
            <Box sx={{ marginBottom: 4 }}>
                <Typography variant="h1" color="error" gutterBottom>
                    404
                </Typography>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                    Oops! The page you're looking for doesn't exist.
                </Typography>
                <img 
                    src="https://via.placeholder.com/300" // Replace with a custom 404 image or icon
                    alt="404 Illustration"
                    style={{ width: '100%', maxWidth: '300px', margin: '20px auto' }}
                />
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={handleGoHome}
                sx={{ textTransform: 'none', marginTop: 2 }}
            >
                Go to Home
            </Button>
        </Container>
    );
};

export default NotFound;
