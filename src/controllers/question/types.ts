interface BlockLabel {
  en: string;
  bn: string;
}

interface Block {
  label: BlockLabel;
  value: string;
}

export type DistrictBlocks = {
  [key: string]: Block[];
};

export interface LabelOption {
  label: { en: string; bn: string };
  value: string;
}

export type OptionKey =
  //   | "districts"
  | "threats"
  | "fishing_gears"
  | "water_bodies"
  | "water_body_conditions"
  | "weather_conditions";

export interface QuestionRow {
  topic: string;
  label_en: string;
  label_bn: string;
  option_key: OptionKey;
  type: string;
  is_optional: boolean;
  index: number;
  last_updated_at: string;
}

export interface DataObject {
  //   districts: LabelOption[] | null;
  threats: LabelOption[] | null;
  fishing_gears: LabelOption[] | null;
  water_bodies: LabelOption[] | null;
  water_body_conditions: LabelOption[] | null;
  weather_conditions: LabelOption[] | null;
  yes_no: LabelOption[] | null;
  channel_types: LabelOption[] | null;
}

export interface FormattedQuestion {
  topic: string;
  label: { en: string; bn: string };
  optionKey?: string;
  options?: LabelOption[];
  type: string;
  isOptional: boolean;
}
