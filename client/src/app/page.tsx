"use client"
import { ChangeEvent, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {  PDFDownloadLink,  } from '@react-pdf/renderer';
import { Button, Typography, Box, Rating } from '@mui/material'

import LinearProgressWithLabel from './components/LinearProgressWithLabel';
import PDFDocument from './components/PdfDocument'

import styles from './page.module.css'

type AppState = 'initial' | 'loading' | 'result';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('initial');
  const [image, setImage] = useState<File | null>(null);
  const imageSrc = useMemo(() => image && URL.createObjectURL(image), [image]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const handleInput = ({target: {files}}: ChangeEvent<HTMLInputElement>) => {
    const file = files?.[0];
    if(!file) return;
    setImage(file);
    setAppState('loading');
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if(prevProgress >= 100) {
          setAppState('result');
          clearInterval(timer);
          return 0;
        }
        return prevProgress + 10;
      });
    }, 800);
  }
  const [rating, setRating] = useState(2.5);
  return (
    <main className={styles.main}>
      <Typography variant='h3' align='center'>
       Recognizing car brands by image
      </Typography>
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
          With a probability of 99% it is a Mercedes
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Typography component="legend">Rate the recognition result</Typography>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newValue) => {
              newValue && setRating(newValue);
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
              document={<PDFDocument imageSrc={imageSrc} text='With a probability of 99% it is a Mercedes'/>} 
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
