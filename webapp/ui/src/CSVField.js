import React, {useCallback, useEffect, useState} from 'react';
import {Box, Grid, IconButton, TextField, Typography} from '@mui/material';
import FileOpenOutlinedIcon from '@mui/icons-material/FileOpenOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import {useDropzone} from 'react-dropzone';
import isEqual from 'lodash/isEqual';
import {parseCSV} from "./utils";

const constructCsvText = (data) => {
  let csvText = 'frequency,raw\n';
  if (data.length === 0) {
    csvText += '20,0\n20000,0'
  } else {
    for (let i = 0; i < data.length; ++i) {
      const f = data[i].frequency.toString().length < data[i].frequency.toFixed(1).length
        ? data[i].frequency.toString()
        : data[i].frequency.toFixed(1);
      const r = data[i].raw.toString().length < data[i].raw.toFixed(2).length
        ? data[i].raw.toString()
        : data[i].raw.toFixed(2);
      csvText += f + ',' + r + '\n';
    }
  }
  return csvText.trim();
};

const CSVField = (props) => {
  const [csvText, setCsvText] = useState(constructCsvText([]));
  const [error, setError] = useState('');

  useEffect(() => {
    if (props.value?.length > 0) {
      //const newCsvText = constructCsvText(props.value);
      const parsedValue = parseCSV(csvText);
      if (!isEqual(props.value, parsedValue)) {
        setCsvText(constructCsvText(props.value));
      }
    }
  }, [props.value])

  const onCsvTextChanged = (csv) => {
    setCsvText(csv);
    try {
      props.onChange(parseCSV(csv));
      setError('');
    } catch (e) {
      setError(e.toString());
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        if ('onFileUploaded' in props) {
          props.onFileUploaded(file.name);
        }
        onCsvTextChanged(reader.result);
      }
      reader.readAsText(file);
    });
  }, [])
  const {getRootProps, getInputProps, isDragAccept, open} = useDropzone({onDrop, noClick: true, noKeyboard: true});

  const onClearClick = () => {
    onCsvTextChanged(constructCsvText([]));
  };

  const rows = Math.max(props.minRows || 3, Math.min(props.maxRows || 10, csvText.split('\n').length));
  return (
    <Grid container direction='column'>
      <Grid item>
        <Box { ...getRootProps() } sx={{position: 'relative'}}>
          <Box
            sx={{
              position: 'absolute', top: '50%', transform: 'translateY(-50%)',
              right: '70px',
              left: {xs: '40%', sm: '50%', md: '40%'},
              color: isDragAccept ? theme => theme.palette.info : theme => theme.palette.text.secondary,
              textAlign: 'center',
            }}
          >
            {props.helperText || (
              <span>
                <Typography variant='body2' sx={{display: 'inline'}}>Edit the text directly, drop a CSV file or click </Typography>
                <FileOpenOutlinedIcon sx={{display: 'inline', height: '17px', width: '16px', transform: 'translate(-1px, 3px)'}} />
                <Typography variant='body2' sx={{display: 'inline'}}> to open a file.</Typography>
              </span>
            )}
          </Box>
          <TextField
            multiline rows={rows} value={csvText}
            inputProps={{ style: { fontFamily: 'monospace', marginRight: '24px' } }}
            onChange={e => { onCsvTextChanged(e.target.value); }}
            label={props.label || 'CSV Data'}
            error={!!error}
            sx={{
              width: '100%',
              textField: { paddingRight: '40px'},
              backgroundColor: isDragAccept ? 'rgb(249,255,249)' : theme => theme.palette.background.default,
            }}
            size='small'
          />
          <Box sx={{position: 'absolute', top: 0, right: 0}}>
            <IconButton onClick={onClearClick}>
              <ClearIcon />
            </IconButton>
          </Box>
          <Box sx={{position: 'absolute', top: 40, right: 0}}>
            <IconButton onClick={open}>
              <FileOpenOutlinedIcon />
            </IconButton>
          </Box>
          <input { ...getInputProps() } />
        </Box>
      </Grid>
      {!!error && (
        <Grid item>
          <Typography color='error' variant='caption'>{error}</Typography>
        </Grid>
      )}
    </Grid>

  );
};

export default CSVField;
