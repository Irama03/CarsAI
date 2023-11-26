"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { Button, Typography, LinearProgress, Box, Rating } from '@mui/material'
import { ChangeEvent, ChangeEventHandler, useEffect, useMemo, useRef, useState } from 'react'
import LinearProgressWithLabel from './components/LinearProgressWithLabel';
import StarIcon from '@mui/icons-material/StarBorder';
import { usePDF } from 'react-to-pdf'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image as PdfImage } from '@react-pdf/renderer';
const styles1 = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});
// const MyDocument = ({src: string}) => (
//   <Document>
//     <Page size="A4" style={styles1.page}>
//       <PdfImage src={src}/>
//       <Text>Test</Text>
//     </Page>
//   </Document>
// );

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
  const { toPDF, targetRef } = usePDF({filename: 'page.pdf'});
  return (
    <main className={styles.main}>
      <Typography variant='h3' align='center'>
        Система розпізнавання марок автомобілів за зображенням
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
          Обрати зображення
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
      {appState === 'result' && imageSrc && <div ref={targetRef}>
        <Image
          src={imageSrc}
          alt='Your image'
          width={500}
          height={500}
          style={{objectFit: "contain"}}
        />
        <Typography variant="h4" color="text.secondary">
          З вірогідністю 99% це Mersedes
        </Typography>
        <Typography component="legend">Оцініть результат розпізнавання</Typography>
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            newValue && setRating(newValue);
          }}
        />
        <Button 
          variant="contained"
          onClick={() => inputRef.current?.click()}
        >
          Спробувати знову
        </Button>
        <Button 
          variant="contained"
          // onClick={() => renderToStream(<MyDocument />)}
        >
          Завантажити
        </Button>
      </div>}
      {/* <PDFDownloadLink document={<MyDocument src={imageSrc || ''}/>} fileName="somename.pdf">
      {({ blob, url, loading, error }) =>
        loading ? 'Loading document...' : 'Download now!'
      }
    </PDFDownloadLink> */}
    </main>
  )
}
