import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {ArrayFieldTemplateProps} from '@rjsf/utils';

import {FormArrayFieldTemplate} from './FormArrayFieldTemplate';

describe('FormArrayFieldTemplate', () => {
  function render(overrides: Partial<ArrayFieldTemplateProps> = {}) {
    const props = {
      items: [createElement('button', {key: 'remove', type: 'button'}, 'Remove item')],
      canAdd: true,
      onAddClick: jest.fn(),
      ...overrides,
    } as unknown as ArrayFieldTemplateProps;
    return renderToStaticMarkup(createElement(FormArrayFieldTemplate, props));
  }

  it('renders RJSF item elements including their controls', () => {
    expect(render()).toContain('Remove item');
    expect(render()).toContain('Add Item');
  });

  it.each([{readonly: true}, {disabled: true}])('disables Add Item when %j', props => {
    expect(render(props)).toMatch(/disabled=""/);
  });

  it('omits Add Item when the schema disallows additions', () => {
    expect(render({canAdd: false})).not.toContain('Add Item');
  });
});
