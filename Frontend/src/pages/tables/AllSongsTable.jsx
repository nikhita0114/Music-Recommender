import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useUser } from "../../components/UserContext";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import "./Table.css";

import Swal from 'sweetalert2';


import { useNavigate } from 'react-router-dom';

const paginationModel = { page: 0, pageSize: 10 };

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const { user } = useUser();
  const [open, setOpen] = useState(false); // Modal open state
  const [selectedSong, setSelectedSong] = useState(null); // Song being edited
  const [updatedSong, setUpdatedSong] = useState({ title: '', artist: '', genre: '', mood: '', image_url: '' });

  // const { user } = useUser(); // Get the user data from context
  const navigate = useNavigate(); // Use React Router's navigate function

  // Redirect to 404 if user is not an admin
  useEffect(() => {
    if (!user || user.type !== 1) {
        navigate('/NotFound'); // Navigate to a 404 page if user is not admin
    }
}, [user, navigate]);

  // Fetch song data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GET_ALL_SONGS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "Technxt@gmail.com",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const transformedData = data.songs.map((song, index) => ({
            slno: index + 1,
            id: song.id, // Required for DataGrid
            title: song.title,
            artist: song.artist,
            genre: song.genre,
            mood: song.mood,
            image_url: song.image_url,
          }));
          setRows(transformedData);
        } else {
          console.error("Failed to fetch data", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user.email]);

  


const handleDeleteSong = async (songId) => {
  const confirmation = await Swal.fire({
    title: 'Are you sure?',
    text: "Do you really want to delete this song? This action cannot be undone.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });

  if (confirmation.isConfirmed) {
    try {
      const response = await fetch(`${import.meta.env.VITE_DELETE_SONG_ENDPOINT}${songId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setRows((prevRows) => prevRows.filter((row) => row.id !== songId));
        Swal.fire('Deleted!', 'The song has been deleted.', 'success');
      } else {
        console.error('Failed to delete song');
        Swal.fire('Error!', 'Failed to delete the song.', 'error');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      Swal.fire('Error!', 'Something went wrong.', 'error');
    }
  }
};




  // Handle the editing of a song
  const handleEditSong = (song) => {
    setSelectedSong(song); // Set the song to be edited
    setUpdatedSong({ ...song }); // Populate the form with the current song data
    setOpen(true); // Open the modal
  };

  // Handle the change in input fields for the song
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedSong((prevSong) => ({
      ...prevSong,
      [name]: value,
    }));
  };

  // Handle the save (update) of the song
  const handleSaveSong = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_EDIT_SONG_ENDPOINT}${selectedSong.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSong),
      });
  
      if (response.ok) {
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === selectedSong.id ? { ...row, ...updatedSong } : row))
        );
        setOpen(false);
        alert('Song updated successfully');
      } else {
        console.error('Failed to update song');
      }
    } catch (error) {
      console.error('Error updating song:', error);
    }
  };
  

  const columns = [
    { field: 'slno', headerName: 'Sl.No.', width: 100 },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'artist', headerName: 'Artist', width: 200 },
    { field: 'genre', headerName: 'Genre', width: 200 },
    { field: 'mood', headerName: 'Mood', width: 200 },
    {
      field: 'image_url',
      headerName: 'Cover',
      width: 150,
      renderCell: (params) => (
        <img
          src={params.value}
          alt="Cover"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* <button onClick={() => handleEditSong(params.row)} className='text-primary p-5'>Edit</button>
          <button onClick={() => handleDeleteSong(params.row.id)} className='text-danger p-5'>Delete</button> */}
           <Button
        onClick={() => handleEditSong(params.row)}
        variant="contained"
        color="primary"
        sx={{
          padding: '8px 16px',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '4px',
        }}
      >
        Edit
      </Button>

      {/* Delete Button */}
      <Button
        onClick={() => handleDeleteSong(params.row.id)}
        variant="contained"
        color="error"
        sx={{
          padding: '8px 16px',
          fontWeight: 'bold',
          fontSize: '16px',
          borderRadius: '4px',
        }}
      >
        Delete
      </Button>
        </div>
      ),
    },
  ];

  return (
    <Paper
      sx={{
        height: 700,
        width: '90%',
        margin: 'auto',
        textAlign: 'center',
        alignContent: 'center',
        padding: '25px',
      }}
    >
      <h1>Total Available Songs</h1>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{
          '& .MuiDataGrid-root': {
            fontSize: '20px',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'red',
            color: 'black',
            fontSize: '20px',
            fontWeight: 'bolder',
            textAlign: 'center',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            textAlign: 'center',
            fontSize: '20px',
          },
          '& .MuiDataGrid-cell': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
          },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: '#f5f5f5',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: '#ffffff',
          },
        }}
      />

      {/* Modal for Editing Song */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            name="title"
            value={updatedSong.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Artist"
            name="artist"
            value={updatedSong.artist}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Genre"
            name="genre"
            value={updatedSong.genre}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Mood"
            name="mood"
            value={updatedSong.mood}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Image URL"
            name="image_url"
            value={updatedSong.image_url}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">Cancel</Button>
          <Button onClick={handleSaveSong} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
