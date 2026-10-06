import {createSelectorCreator, lruMemoize} from 'reselect';

import {isEqual} from '@shared/utils/isEqual';

export const createDeepEqualSelector = createSelectorCreator(lruMemoize, isEqual);
