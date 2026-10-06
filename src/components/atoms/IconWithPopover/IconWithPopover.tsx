import React from 'react';

import {Button, Popover} from 'antd';
import type {ButtonProps, PopoverProps} from 'antd';

import { Icon, IconNames } from "@components/foundation/primitives";

interface IconWithPopoverProps {
  popoverContent: React.ReactNode | (() => React.ReactNode);
  popoverTrigger: PopoverProps['trigger'];
  isDisabled?: boolean;
  iconName?: IconNames;
  buttonType?: ButtonProps['type'] | 'ghost';
  iconComponent: React.ReactNode;
}

const IconWithPopover: React.FC<IconWithPopoverProps> = props => {
  const {popoverContent, popoverTrigger, isDisabled = false, iconName, buttonType = 'link', iconComponent} = props;

  const iconToDisplay = iconComponent || (iconName ? <Icon name={iconName} /> : null);

  return (
    <Popover content={isDisabled ? <span>Filter is disabled</span> : popoverContent} trigger={popoverTrigger}>
      <Button disabled={isDisabled} type={buttonType === 'ghost' ? 'default' : buttonType} ghost={buttonType === 'ghost'} size="small" icon={iconToDisplay} />
    </Popover>
  );
};

export default IconWithPopover;
