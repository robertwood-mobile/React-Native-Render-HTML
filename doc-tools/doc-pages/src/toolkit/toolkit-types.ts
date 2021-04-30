import type { ComponentType, PropsWithChildren } from 'react';
import type { RenderHTMLProps } from 'react-native-render-html';
import type * as RN from 'react-native';
import type {
  Acronym,
  AcronymDefinition,
  PageId,
  PageSpecs
} from '../pages-types';

type RefComponent<T extends string = string> = ComponentType<{ name: T }>;

export type SvgAssetType = 'data-flow';

export type AdmonitionType =
  | 'note'
  | 'tip'
  | 'warning'
  | 'important'
  | 'caution';

export type SourceDisplayProps = {
  lang: string;
  content: string;
  title?: string;
  showLineNumbers: boolean;
};
export interface UIToolkitBase {
  Container?: ComponentType<PropsWithChildren<{}>>;
  Header: ComponentType<PropsWithChildren<{}>>;
  Chapter: ComponentType<{ title: string }>;
  Paragraph: ComponentType<{}>;
  SourceDisplay: ComponentType<SourceDisplayProps>;
  Admonition: ComponentType<
    PropsWithChildren<{ type: AdmonitionType; title?: string }>
  >;
  List: ComponentType<PropsWithChildren<{ type?: 'upper-alpha' | 'decimal' }>>;
  ListItem: ComponentType<PropsWithChildren<{}>>;
  InlineCode: ComponentType<PropsWithChildren<{}>>;
  Hyperlink: ComponentType<PropsWithChildren<{ url: string }>>;
}

export interface UIToolkitRefs {
  RefHtmlAttr: RefComponent;
  RefHtmlElement: RefComponent;
  RefESSymbol: RefComponent;
  RefCssProperty: RefComponent;
  RefRNSymbol: RefComponent<keyof typeof RN>;
  RefLibrary: ComponentType<{ name: string; url: string }>;
}

export interface UIToolkit extends UIToolkitBase, UIToolkitRefs {
  RenderHtmlCard: ComponentType<{
    html: string;
    title: string;
    caption?: string;
  }>;
  RefDoc: ComponentType<{ target: PageId }>;
  Acronym: ComponentType<{ name: Acronym }>;
  SvgFigure: ComponentType<{ asset: SvgAssetType }>;
  RefRenderHtmlProp: RefComponent<keyof RenderHTMLProps>;
}

export type UIToolkitConfig = {
  RefBuilder: ComponentType<{ name: string; url: string }>;
  RenderHtmlCard: ComponentType<{
    html: string;
    snippet: string;
    title: string;
    caption?: string;
  }>;
  RefDoc: ComponentType<{ target: PageSpecs }>;
  Acronym: ComponentType<AcronymDefinition>;
  SvgFigure: ComponentType<{ asset: SvgAssetType; description: string }>;
  RefRenderHtmlProp: ComponentType<{
    name: keyof RenderHTMLProps;
    pageAbsoluteUrl: string;
    docRelativePath: string;
    fragment: string;
  }>;
} & UIToolkitBase;
