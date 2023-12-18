"use client"
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {  PDFDownloadLink,  } from '@react-pdf/renderer';
import { Button, Typography, Box, Rating } from '@mui/material'

import LinearProgressWithLabel from './components/LinearProgressWithLabel';
import PDFDocument from './components/PdfDocument'

import styles from './page.module.css'
import axios from 'axios';

type AppState = 'initial' | 'loading' | 'result';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [image, setImage] = useState<File | null>(null);
  const imageSrc = useMemo(() => image && URL.createObjectURL(image), [image]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [mark, setMark] = useState(null);
  const [probability, setProbability] = useState(null);
  const handleInput = ({target: {files}}: ChangeEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if(!file) return;
    setImage(file);
    setAppState('loading');
    axios.postForm('http://localhost:5000/result', {
      car_image: file
    })
      .then(function (response) {
        setMark(response.data.mark);
        setProbability(response.data.probability)
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if(prevProgress >= 100) {
          setAppState('result');
          clearInterval(timer);
          return 0;
        }
        return prevProgress + 10;
      });
    }, 300);
  }
  const [rating, setRating] = useState(0);
  console.log(rating);
  useEffect(() => {
    axios.get('http://localhost:5000/rate')
      .then(function (response) {
        // handle success
        setRating(response.data.average);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
      });
  }, [])
  return (
    <main className={styles.main}>
      <Typography variant='h3' align='center'>
       Recognizing car brands by image
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography component="legend">Our Average rating is</Typography>
        <Rating
          readOnly
          value={rating}
        />
        <Typography component="legend">{rating}</Typography>
      </Box>
      <input
        hidden
        type='file'
        ref={inputRef}
        accept="image/*"
        multiple={false}
        onChange={handleInput}
      />
      {appState === 'initial' && 
        <Button 
          variant="contained"
          onClick={() => inputRef.current?.click()}
        >
          Choose Image
        </Button>
      }
      {appState === 'loading' && imageSrc && <>
        <Image
          src={imageSrc}
          alt='Your image'
          width={500}
          height={500}
          style={{objectFit: "contain"}}
        />
        <Box sx={{ width: '100%' }}>
          <LinearProgressWithLabel value={progress} />
        </Box>
      </>}
      {appState === 'result' && imageSrc && <>
        <Image
          src={imageSrc}
          alt='Your image'
          width={500}
          height={500}
          style={{objectFit: "contain"}}
        />
        <Typography variant="h4" color="text.secondary">
          With a probability of {probability}% it is {mark}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography component="legend">Rate the recognition result</Typography>
          <Rating
            value={userRating}
            onChange={(event, newValue) => {
              if(!newValue) return;
              setUserRating(newValue);
              axios.post('http://localhost:5000/rate', {
                rating: newValue
              })
                .then(function (response) {
                  // handle success
                  setRating(response.data.average);
                })
                .catch(function (error) {
                  // handle error
                  console.log(error);
                })
                .finally(function () {
                  // always executed
                });
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained"
            onClick={() => inputRef.current?.click()}
          >
            Try again
          </Button>
          <Button 
            variant="contained"
          >
            <PDFDownloadLink 
              document={<PDFDocument imageSrc={imageSrc} text={`With a probability of ${probability}% it is ${mark}`}/>} 
              fileName="result.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? 'Loading document...' : 'Download result'
              }
            </PDFDownloadLink>
          </Button>
        </Box>
      </>}
    </main>
  )
}
