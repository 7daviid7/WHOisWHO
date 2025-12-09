import { PredefinedQuestion } from '../types';

export const predefinedQuestions: PredefinedQuestion[] = [
  // Gender Questions
  {
    id: 'q1',
    question: 'És home el teu personatge?',
    attribute: 'gender',
    value: 'home',
    category: 'gender'
  },
  {
    id: 'q2',
    question: 'És dona el teu personatge?',
    attribute: 'gender',
    value: 'dona',
    category: 'gender'
  },
  
  // Hair Color Questions
  {
    id: 'q3',
    question: 'Té el cabell ros?',
    attribute: 'hairColor',
    value: 'ros',
    category: 'hair'
  },
  {
    id: 'q4',
    question: 'Té el cabell negre?',
    attribute: 'hairColor',
    value: 'negre',
    category: 'hair'
  },
  {
    id: 'q5',
    question: 'Té el cabell castany?',
    attribute: 'hairColor',
    value: 'castany',
    category: 'hair'
  },
  {
    id: 'q6',
    question: 'Té el cabell pel-roig?',
    attribute: 'hairColor',
    value: 'pel-roig',
    category: 'hair'
  },
  {
    id: 'q7',
    question: 'Té el cabell blanc?',
    attribute: 'hairColor',
    value: 'blanc',
    category: 'hair'
  },
  
  // Eye Color Questions
  {
    id: 'q8',
    question: 'Té els ulls blaus?',
    attribute: 'eyeColor',
    value: 'blau',
    category: 'eyes'
  },
  {
    id: 'q9',
    question: 'Té els ulls marrons?',
    attribute: 'eyeColor',
    value: 'marró',
    category: 'eyes'
  },
  {
    id: 'q10',
    question: 'Té els ulls verds?',
    attribute: 'eyeColor',
    value: 'verd',
    category: 'eyes'
  },
  
  // Accessories - Beard
  {
    id: 'q11',
    question: 'Porta barba?',
    attribute: 'hasBeard',
    value: 'true',
    category: 'accessories'
  },
  {
    id: 'q12',
    question: 'No porta barba?',
    attribute: 'hasBeard',
    value: 'false',
    category: 'accessories'
  },
  
  // Accessories - Glasses
  {
    id: 'q13',
    question: 'Porta ulleres?',
    attribute: 'hasGlasses',
    value: 'true',
    category: 'accessories'
  },
  {
    id: 'q14',
    question: 'No porta ulleres?',
    attribute: 'hasGlasses',
    value: 'false',
    category: 'accessories'
  },
  
  // Accessories - Hat
  {
    id: 'q15',
    question: 'Porta barret?',
    attribute: 'hasHat',
    value: 'true',
    category: 'accessories'
  },
  {
    id: 'q16',
    question: 'No porta barret?',
    attribute: 'hasHat',
    value: 'false',
    category: 'accessories'
  }
];
