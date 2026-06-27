export type TierQuestionRow = {
  id: string;
  index: number;
  label_en: string;
  label_bn: string;
};

export type TierQuestionOptionRow = {
  id: string;
  question_id: string;
  index: number;
  label_en: string;
  label_bn: string;
  is_correct?: boolean;
};

export type AssessmentAnswer = {
  question: string;
  option: string;
};

export type SubmitAssessmentBody = {
  answers: AssessmentAnswer[];
};
