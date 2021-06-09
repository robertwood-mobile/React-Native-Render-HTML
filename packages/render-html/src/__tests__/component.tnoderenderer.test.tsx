import React from 'react';
import { render } from 'react-native-testing-library';
import RenderHTML from '../RenderHTML';

describe('TNodeRenderer', () => {
  it('should warn user when a TNode is empty and unregistered', () => {
    global.console.warn = jest.fn();
    render(<RenderHTML contentWidth={0} source={{ html: '<bluecircle/>' }} />);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('There is no custom renderer registered for tag ')
    );
  });
  it('should warn user when a TNode is empty and registered', () => {
    global.console.warn = jest.fn();
    render(<RenderHTML contentWidth={0} source={{ html: '<meta/>' }} />);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('tag is a valid HTML element but is not handled')
    );
  });
  it('should not warn user when a TNode is <head>', () => {
    global.console.warn = jest.fn((...args) => console.info(...args));
    render(<RenderHTML contentWidth={0} source={{ html: '<head/>' }} />);
    expect(console.warn).not.toHaveBeenCalled();
  });
  it('should not warn when __DEV__ is false', () => {
    //@ts-ignore
    global.__DEV__ = false;
    global.console.warn = jest.fn();
    render(<RenderHTML contentWidth={0} source={{ html: '<bluecircle/>' }} />);
    expect(console.warn).not.toHaveBeenCalled();
    //@ts-ignore
    global.__DEV__ = true;
  });
});
