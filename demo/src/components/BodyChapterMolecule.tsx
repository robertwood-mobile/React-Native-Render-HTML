import { Stack } from '@mobily/stacks';
import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';
import { useColorRoles } from '../theme/colorSystem';
import BodyDividerAtom from './BodyDividerAtom';
import BoxNucleon from './nucleons/BoxNucleon';
import TextRoleNucleon from './nucleons/TextRoleNucleon';
import { PropsWithStyle } from './nucleons/types';

function BodyHeader1({
  children,
  style
}: PropsWithStyle<PropsWithChildren<{}>>) {
  const { surface } = useColorRoles();
  const color = surface.secondaryContent;
  return (
    <Stack space={1}>
      <BodyDividerAtom height={StyleSheet.hairlineWidth} color={color} />
      <BoxNucleon paddingX={2}>
        <TextRoleNucleon color={color} role="bodyHeader1" style={style}>
          {children}
        </TextRoleNucleon>
      </BoxNucleon>
      <BodyDividerAtom height={StyleSheet.hairlineWidth} color={color} />
    </Stack>
  );
}

export type BodyChapterMoleculeProps = PropsWithChildren<
  PropsWithStyle<{ title: string; prefix?: string }>
>;

export default function BodyChapterMolecule({
  title,
  style,
  prefix,
  children
}: BodyChapterMoleculeProps) {
  return (
    <Stack style={style} space={4}>
      <BodyHeader1>
        {prefix}
        {title}
      </BodyHeader1>
      {children}
    </Stack>
  );
}
