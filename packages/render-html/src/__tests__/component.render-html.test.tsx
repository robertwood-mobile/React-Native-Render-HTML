import React from 'react';
import { render } from 'react-native-testing-library';
import RenderHTML from '../RenderHTML';
import ImgTag from '../elements/IMGElement';
import TTextRenderer from '../TTextRenderer';
import { CustomTextualRenderer } from '../render/render-types';

describe('RenderHTML', () => {
  it('should render without error when providing a source', () => {
    expect(() =>
      render(
        <RenderHTML source={{ html: '<p>Hello world</p>' }} debug={false} />
      )
    ).not.toThrow();
  });
  it('should render without error when missing a source', () => {
    //@ts-expect-error
    expect(() => render(<RenderHTML debug={false} />)).not.toThrow();
  });
  it('should update ImgTag contentWidth when contentWidth prop changes', () => {
    const contentWidth = 300;
    const nextContentWidth = 200;
    const { UNSAFE_getByType, update } = render(
      <RenderHTML
        source={{ html: '<img src="https://img.com/1" />' }}
        debug={false}
        contentWidth={contentWidth}
      />
    );
    expect(UNSAFE_getByType(ImgTag).props.contentWidth).toBe(contentWidth);
    update(
      <RenderHTML
        source={{ html: '<img src="https://img.com/1" />' }}
        debug={false}
        contentWidth={nextContentWidth}
      />
    );
    expect(UNSAFE_getByType(ImgTag).props.contentWidth).toBe(nextContentWidth);
  });
  it('should support fonts from tagsStyles specified in systemFonts', () => {
    const tagsStyles = {
      span: {
        fontFamily: 'Superfont'
      }
    };
    const { getByTestId } = render(
      <RenderHTML
        source={{ html: '<span>hi</span>' }}
        debug={false}
        tagsStyles={tagsStyles}
        systemFonts={['Superfont']}
        contentWidth={100}
      />
    );
    const span = getByTestId('span');
    expect(span.props.style).toMatchObject(tagsStyles.span);
  });
  describe('regarding markers', () => {
    it('should set `anchor` marker for `a` tags', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{ html: '<a href="test">Yuhuuu</a>' }}
          debug={false}
          contentWidth={100}
        />
      );
      const ttext = UNSAFE_getByType(TTextRenderer);
      expect(ttext.props.markers.anchor).toBe(true);
    });
    it('should set `edits` marker to "ins" for `ins` tags', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{ html: '<ins>Yuhuuu</ins>' }}
          debug={false}
          contentWidth={100}
        />
      );
      const ttext = UNSAFE_getByType(TTextRenderer);
      expect(ttext.props.markers.edits).toBe('ins');
    });
    it('should set `edits` marker to "del" for `del` tags', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{ html: '<del>Yuhuuu</del>' }}
          debug={false}
          contentWidth={100}
        />
      );
      const ttext = UNSAFE_getByType(TTextRenderer);
      expect(ttext.props.markers.edits).toBe('del');
    });
    it('should set `lang` marker for `lang` attributes', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{ html: '<p lang="fr">Voila !</p>' }}
          debug={false}
          contentWidth={100}
        />
      );
      const ttext = UNSAFE_getByType(TTextRenderer);
      expect(ttext.props.markers.lang).toBe('fr');
    });
    it('should set `dir` marker for `dir` attributes', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{ html: '<p dir="rtl">ٱلسَّلَامُ عَلَيْكُمْ‎</p>' }}
          debug={false}
          contentWidth={100}
        />
      );
      const ttext = UNSAFE_getByType(TTextRenderer);
      expect(ttext.props.markers.direction).toBe('rtl');
    });
    it('should pass markers deep down in the tree', () => {
      const EmRenderer: CustomTextualRenderer = ({
        TDefaultRenderer,
        ...props
      }) => <TDefaultRenderer {...props} />;
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{
            html: '<div lang="test"><span>One<em>Two</em></span></div>'
          }}
          renderers={{ em: EmRenderer }}
          debug={false}
          contentWidth={100}
        />
      );
      const em = UNSAFE_getByType(EmRenderer);
      expect(em.props.markers.lang).toBe('test');
    });
    it('should handle setMarkersForTNode prop', () => {
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{
            html: '<em>Two</em>'
          }}
          debug={false}
          setMarkersForTNode={(tnode) =>
            tnode.tagName === 'em' ? { em: true } : null
          }
          contentWidth={100}
        />
      );
      const em = UNSAFE_getByType(TTextRenderer);
      expect(em.props.markers.em).toBe(true);
    });
  });
  describe('regarding propsFromParent', () => {
    it('should pass propsForChildren to children', () => {
      const SpanRenderer: CustomTextualRenderer = ({
        TDefaultRenderer,
        ...props
      }) => <TDefaultRenderer {...props} propsForChildren={{ test: 1 }} />;
      const EmRenderer: CustomTextualRenderer = ({
        TDefaultRenderer,
        ...props
      }) => <TDefaultRenderer {...props} />;
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{
            html: '<span>One<em>Two</em></span>'
          }}
          renderers={{ span: SpanRenderer, em: EmRenderer }}
          debug={false}
          contentWidth={100}
        />
      );
      const em = UNSAFE_getByType(EmRenderer);
      expect(em.props.propsFromParent.test).toBe(1);
    });
    it('should not pass propsForChildren to sub-children', () => {
      const SpanRenderer: CustomTextualRenderer = ({
        TDefaultRenderer,
        ...props
      }) => <TDefaultRenderer {...props} propsForChildren={{ test: 1 }} />;
      const EmRenderer: CustomTextualRenderer = ({
        TDefaultRenderer,
        ...props
      }) => <TDefaultRenderer {...props} />;
      const { UNSAFE_getByType } = render(
        <RenderHTML
          source={{
            html: '<span>One<b><em>Two</em></b></span>'
          }}
          renderers={{ span: SpanRenderer, em: EmRenderer }}
          debug={false}
          contentWidth={100}
        />
      );
      const em = UNSAFE_getByType(EmRenderer);
      expect(em.props.propsFromParent.test).toBeUndefined();
    });
  });
});
