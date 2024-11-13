"use strict";
//这段代码已经弃用
/*
const pool = createPool({
  host: 'localhost',
  user: 'root',
  password: '588614cax051311',
  database: 'enlearning'
});

export const getWord = async (type: number): Promise<any> => {
  console.log('Fetching word data from database...');
  try {
    const [rows] = await pool.query('SELECT * FROM wordsheet');
    if (rows.length === 0) {
      throw new Error('No words found in the database');
    }
    const allWords = rows.map(row => ({
      id: row.id,
      word: row.word,
      part_of_speech: row.part_of_speech,
      chinese_meaning: row.chinese_meaning
    }));
    const correctWord = allWords[Math.floor(Math.random() * allWords.length)];
    const incorrectWords = allWords.filter(word => word.id !== correctWord.id);
    let options = [...incorrectWords.slice(0, 3), correctWord];
    if (type === 1) {
      options = options.map(word => word.chinese_meaning);
    } else if (type === 2) {
      options = options.map(word => word.word);
    }
    options.sort(() => Math.random() - 0.5);
    return {
      question: correctWord.word,
      part_of_speech: correctWord.part_of_speech,
      meaning: type === 1 ? correctWord.chinese_meaning : '',
      options,
      answer: options.indexOf(type === 1 ? correctWord.chinese_meaning : correctWord.word)
    };
  } catch (error) {
    console.error('Error fetching word data:', error);
    throw error;
  }
};
*/ 
