import React from 'react';
import { render } from 'react-native-testing-library';
import { StyleSheet } from 'react-native';
import RenderHTML from '../RenderHTML';

/**
 * https://github.com/meliorence/react-native-render-html/issues/172
 */
describe('HTMLImageElement component should pass regression test #172', () => {
  it('passes resizeMode to RN Image component', async () => {
    const tagsStyles = {
      img: {
        resizeMode: 'contain',
        width: 100,
        height: 100
      }
    };
    const { getByTestId } = render(
      <RenderHTML
        debug={false}
        source={{
          html: '<img width="100" height="100" src="http://via.placeholder.com/100x100" />'
        }}
        tagsStyles={tagsStyles as any}
      />
    );
    const imageLayout = getByTestId('image-success');
    expect(StyleSheet.flatten(imageLayout.props.style)).toMatchObject(
      tagsStyles.img
    );
  });
});
