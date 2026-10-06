import {Button} from 'antd';
import {PlusOutlined} from '@ant-design/icons';

import {ArrayFieldTemplateProps} from '@rjsf/utils';

export const FormArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const {items, canAdd, onAddClick, disabled, readonly} = props;

  return (
    <div>
      {items}
      {canAdd && <Button icon={<PlusOutlined />} disabled={disabled || readonly} onClick={onAddClick}>Add Item</Button>}
    </div>
  );
};
