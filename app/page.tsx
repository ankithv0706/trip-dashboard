"use client"
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { ChangeEvent, useEffect, useState } from 'react';
import ITripData from './interfaces/ITripData';
import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import moment from 'moment';

const modelStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const initialRows = [
  {
    "_id": "65d5ebadf18f49fe4ef592c2",
    "tripId": "e6115a41-4255-4ed5-9fe1-aaedd665f6e4",
    "transporter": "FedEx",
    "tripStartTime": "2024-02-07T10:59:56Z",
    "currentStatusCode": "RD",
    "currenStatus": "Reached Destination",
    "phoneNumber": 9852934197,
    "etaDays": 0,
    "distanceRemaining": 716,
    "tripEndTime": "",
    "source": "Mumbai",
    "sourceLatitude": 8.6,
    "sourceLongitude": 73.4,
    "dest": "Nagpur",
    "destLatitude": 36.3,
    "destLongitude": 95.5,
    "lastPingTime": "2024-02-13T10:59:56.000Z",
    "createdAt": "2024-02-06T10:59:56.000Z"
  },
  {
    "_id": "65d5ebadf18f49fe4ef592c3",
    "tripId": "e6115a41-4255-4ed5-9fe1-aaedd665f6e4",
    "transporter": "FedEx",
    "tripStartTime": "2024-02-07T10:59:56Z",
    "currentStatusCode": "RD",
    "currenStatus": "Reached Destination",
    "phoneNumber": 9852934197,
    "etaDays": 1,
    "distanceRemaining": 716,
    "tripEndTime": "",
    "source": "Mumbai",
    "sourceLatitude": 8.6,
    "sourceLongitude": 73.4,
    "dest": "Nagpur",
    "destLatitude": 36.3,
    "destLongitude": 95.5,
    "lastPingTime": "2024-02-13T10:59:56.000Z",
    "createdAt": "2024-02-06T10:59:56.000Z"
  },
  {
    "_id": "65d5ebadf18f49fe4ef592c4",
    "tripId": "e6115a41-4255-4ed5-9fe1-aaedd665f6e4",
    "transporter": "FedEx",
    "tripStartTime": "2024-02-07T10:59:56Z",
    "currentStatusCode": "RD",
    "currenStatus": "Reached Destination",
    "phoneNumber": 9852934197,
    "etaDays": 1,
    "distanceRemaining": 716,
    "tripEndTime": "2024-02-07T15:59:56.000Z",
    "source": "Mumbai",
    "sourceLatitude": 8.6,
    "sourceLongitude": 73.4,
    "dest": "Surat",
    "destLatitude": 36.3,
    "destLongitude": 95.5,
    "lastPingTime": "2024-02-13T10:59:56.000Z",
    "createdAt": "2024-02-06T10:59:56.000Z"
  }
]

const transporters = [
  "Blue dart",
  "FedEx"
]

const sources = [
  "Mumbai",
  "Nagpur"
]

const destinations = [
  "Surat",
  "Bhopal"
]

let emptyTripData = {
  "_id": "",
  "tripId": "",
  "transporter": "",
  "tripStartTime": "",
  "currentStatusCode": "",
  "currenStatus": "",
  "phoneNumber": 0,
  "etaDays": 0,
  "distanceRemaining": 0,
  "tripEndTime": "",
  "source": "",
  "sourceLatitude": 0,
  "sourceLongitude": 0,
  "dest": "",
  "destLatitude": 0,
  "destLongitude": 0,
  "lastPingTime": "",
  "createdAt": ""
}

const emptyEditableForm = { status: "", date: "" }

const statuses = [
  "Booked",
  "In-Transit",
  "Reached Destination",
  "Delivered"
]

const statusCodes: Record<string, string> = {
  "Booked": "BO",
  "In-Transit": "IT",
  "Reached Destination": "RD",
  "Delivered": "DE"
}

const getTATStatus = (startDateTime: string, endDateTime: string, eta: number) => {
  if (eta === 0) {
    return 'Others'
  }
  const startDate: any = new Date(startDateTime)
  const endDate: any = new Date(endDateTime)
  const oneDay = 24 * 60 * 60 * 1000
  const diff = Math.round(Math.abs((startDate - endDate) / oneDay))
  return diff <= eta ? "on-Time" : "Delayed"
}

const columns: GridColDef[] = [
  { field: '_id', headerName: 'Trip id', width: 200 },
  { field: 'transporter', headerName: 'Transporter' },
  { field: 'source', headerName: 'Source' },
  {
    field: 'dest',
    headerName: 'Destination',
    width: 90,
  },
  { field: 'phoneNumber', headerName: 'Phone' },
  { field: 'etaDays', headerName: 'ETA' },
  { field: 'distanceRemaining', headerName: 'Distance remaining' },
  { field: 'currenStatus', headerName: 'Trip status' },
  {
    field: 'tatStatus', headerName: 'TAT status', valueGetter: (value, row) => {
      return getTATStatus(row.tripStartTime, row.tripEndTime || row.lastPingTime, row.etaDays)
    },
  },
];

export default function Home() {

  const [rows, setRows] = useState<ITripData[]>([])
  const [openAddTrip, setOpenAddTrip] = useState(false);
  const [openUpdateTrip, setOpenUpdateTrip] = useState(false);
  const [tripData, setTripData] = useState<ITripData>({ ...emptyTripData })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [statusOptions, setStatusOptions] = useState<string[]>([])
  const [editableForm, setEditableForm] = useState<{ status: string, date: string }>({ ...emptyEditableForm })

  const handleOpenAddTrip = () => setOpenAddTrip(true);
  const handleCloseAddTrip = () => setOpenAddTrip(false);

  const handleOpenUpdateTrip = () => {

    const selectedRow = rows.find(row => row._id === selectedRows[0]) || { currenStatus: "" };
    setStatusOptions(statuses.slice(statuses.indexOf(selectedRow?.currenStatus) + 1))
    setOpenUpdateTrip(true)

  };
  const handleCloseUpdateTrip = () => setOpenUpdateTrip(false);

  const updateTripData = (event: any, key: string) => {
    setTripData({
      ...tripData,
      [key]: event.target.value
    })
  }

  const updateStatus = (event: SelectChangeEvent) => {
    setEditableForm({ ...editableForm, status: event.target.value })
  }

  const updateTime = (val: any) => {
    setEditableForm({ ...editableForm, date: val.toISOString() })
  }

  const handleAddTrip = () => {
    //validation
    //@ts-ignore
    let emptyFields = ["tripId", "phoneNumber", "transporter", "source", "dest"].filter((key: string) => tripData[key] === "")
    if (emptyFields.length !== 0) {
      alert(`${emptyFields} cannot be empty`)
      return
    }
    setRows([...rows, { ...tripData, _id: `${Date.now()}`, currenStatus: statuses[0] }])
    setTripData({ ...emptyTripData })
    setOpenAddTrip(false)
  }

  const handleUpdateTrip = () => {
    setRows(rows.map((row) => {
      if (row._id === selectedRows[0]) {
        row.currenStatus = editableForm.status
        row.currentStatusCode = statusCodes[editableForm.status]
        row.lastPingTime = editableForm.date
        if (editableForm.status === 'Delivered') {
          row.tripEndTime = editableForm.date
        }
        return row
      } else {
        return row;
      }
    }))
    setEditableForm({ ...emptyEditableForm })
    setOpenUpdateTrip(false)
  }

  useEffect(() => {
    setRows(initialRows)
  }, [])

  return (
    <main>
      <Button onClick={handleOpenAddTrip}>Add Trip</Button>
      <Button onClick={handleOpenUpdateTrip}>Update Trip</Button>
      <DataGrid
        getRowId={(row) => row._id}
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        onRowSelectionModelChange={(ids: any) => {
          setSelectedRows(ids)
        }}
        disableMultipleRowSelection={true}
      />

      <Modal
        open={openUpdateTrip}
        onClose={handleCloseUpdateTrip}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modelStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Update Trip
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Status</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={editableForm.status}
              label="Status"
              onChange={updateStatus}
            >
              {statusOptions.map(status => <MenuItem value={status}>{status}</MenuItem>)}
            </Select>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker label="Time" onChange={updateTime} />
            </LocalizationProvider>
            <Button onClick={handleUpdateTrip}>Update Trip</Button>
          </FormControl>
        </Box>
      </Modal>

      <Modal
        open={openAddTrip}
        onClose={handleCloseAddTrip}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modelStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Trip
          </Typography>
          <TextField id="outlined-basic" label="Trip ID" variant="outlined" onChange={(e) => updateTripData(e, "tripId")} />
          <TextField id="outlined-basic" label="Phone" variant="outlined" onChange={(e) => updateTripData(e, "phoneNumber")} />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Transporter</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tripData.transporter}
              label="Transporter"
              onChange={(e) => updateTripData(e, "transporter")}
            >
              {transporters.map(transporter => <MenuItem value={transporter}>{transporter}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Source</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tripData.source}
              label="Source"
              onChange={(e) => updateTripData(e, "source")}
            >
              {sources.map(source => <MenuItem value={source}>{source}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Destination</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={tripData.dest}
              label="Destination"
              onChange={(e) => updateTripData(e, "dest")}
            >
              {destinations.map(destination => <MenuItem value={destination}>{destination}</MenuItem>)}
            </Select>
            <Button onClick={handleAddTrip}>Add Trip</Button>
          </FormControl>
        </Box>
      </Modal>
    </main>
  );
}
