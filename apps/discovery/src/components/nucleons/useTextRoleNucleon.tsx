/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TextStyle } from 'react-native';
import { useColorRoles } from '../../theme/colorSystem';

export type TextRole =
  // UI roles
  | 'headerTitleFull'
  | 'headerTitle'
  | 'headerSubtitle'
  | 'uiLabel'
  | 'uiDescription'
  | 'uiMono' // For dynamic numbers
  | 'html'
  | 'source'
  | 'sectionOutline'
  | 'footer'
  | 'uiHyperlink'
  // Body roles
  | 'body'
  | 'bodyBold'
  | 'bodyDListHeader'
  | 'bodyHeader1'
  | 'bodyHeader2'
  | 'bodyInlineCode'
  | 'bodyFigureTitle'
  | 'bodyAPIRef'
  | 'caption';

const FONT_BODY = 'Raleway_300Light';
const FONT_BODY_BOLD = 'Raleway_400Regular';
const FONT_BODY_ITALIC = 'Raleway_300Light_Italic';
const FONT_MONO = 'SourceCodePro_400Regular';
const FONT_UI = 'Raleway_400Regular';

const BASE_FONT_SIZE = 16;

const roleDefs: Record<
  TextRole,
  { fontSize: number; fontFamily: string } & TextStyle
> = {
  headerTitleFull: {
    fontSize: BASE_FONT_SIZE * 3.5,
    fontFamily: FONT_UI,
    letterSpacing: 2
  },
  headerTitle: {
    fontSize: BASE_FONT_SIZE * 1.5,
    fontFamily: FONT_UI,
    letterSpacing: 2
  },
  headerSubtitle: { fontSize: BASE_FONT_SIZE * 0.8, fontFamily: FONT_BODY },
  body: {
    fontSize: BASE_FONT_SIZE,
    fontFamily: FONT_BODY,
    lineHeight: BASE_FONT_SIZE * 2
  },
  bodyBold: { fontFamily: FONT_BODY_BOLD, fontSize: 16 },
  bodyFigureTitle: {
    fontSize: BASE_FONT_SIZE * 0.85,
    lineHeight: BASE_FONT_SIZE * 0.85 * 1.4,
    fontFamily: FONT_BODY_BOLD,
    textTransform: 'uppercase'
  },
  bodyTable: { fontSize: BASE_FONT_SIZE * 0.9, fontFamily: FONT_BODY },
  bodyTableHeader: {
    fontSize: BASE_FONT_SIZE * 0.9,
    fontFamily: FONT_BODY_BOLD
  },
  //@ts-ignore
  bodyDListHeader: {
    fontSize: BASE_FONT_SIZE * 1.15,
    lineHeight: BASE_FONT_SIZE * 1.15
  },
  bodyHeader1: {
    fontSize: BASE_FONT_SIZE * 2.5,
    fontFamily: FONT_BODY,
    letterSpacing: 1.5
  },
  bodyHeader2: {
    fontSize: BASE_FONT_SIZE * 1.8,
    fontFamily: FONT_BODY_BOLD,
    letterSpacing: 1.2
  },
  caption: { fontSize: BASE_FONT_SIZE * 0.9, fontFamily: FONT_BODY_ITALIC },
  uiDescription: { fontSize: BASE_FONT_SIZE * 0.8, fontFamily: FONT_UI },
  uiLabel: { fontSize: BASE_FONT_SIZE * 0.9, fontFamily: FONT_UI },
  uiMono: { fontSize: BASE_FONT_SIZE * 0.9, fontFamily: FONT_MONO },
  uiHyperlink: { fontSize: 5, fontFamily: FONT_MONO },
  footer: { fontSize: BASE_FONT_SIZE * 0.8, fontFamily: FONT_MONO },
  //@ts-ignore
  html: { fontSize: BASE_FONT_SIZE * 0.9 },
  //@ts-ignore
  bodyInlineCode: { fontFamily: FONT_MONO },
  //@ts-ignore
  bodyAPIRef: { fontFamily: FONT_MONO },
  sectionOutline: {
    fontSize: BASE_FONT_SIZE * 0.8,
    fontFamily: FONT_UI,
    textTransform: 'uppercase'
  },
  source: { fontSize: BASE_FONT_SIZE * 0.9, fontFamily: FONT_MONO }
};

export interface TextRoleNucleonProps {
  color?: string;
  align?: 'center' | 'start' | 'end';
  role: TextRole;
}

export default function useTextRoleNucleon({
  role,
  align = 'start',
  color
}: TextRoleNucleonProps) {
  const defaultColor = useColorRoles().surface.content;
  const roleStyle = roleDefs[role];
  return {
    color: color ?? defaultColor,
    textAlign:
      align === 'end' ? 'right' : align === 'start' ? 'left' : 'center',
    ...roleStyle
  } as const;
}
