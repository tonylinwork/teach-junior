
export interface Question {
    id: string;
    number: number;
    content: string;
    answer: string;
    explanation: string;
    type?: string;
}

export interface Section {
    type: string;
    name: string;
    questions: Question[];
}

export interface QuizData {
    title: string;
    notice?: string;
    summary?: string;
    warmup?: string;
    sections: Section[];
}

export interface AnswerState {
    [questionId: string]: {
        selectedAnswer: string;
        isCorrect: boolean;
        isSubmitted: boolean;
        needsManualCheck?: boolean;
    };
}
