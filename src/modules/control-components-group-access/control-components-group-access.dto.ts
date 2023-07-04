import ControlComponentsGroupAccess from './control-components-group-access.entity';

export interface ControlComponentsGroupAccessDTO {
  groupID: number;
  controlComponentID: number;
  access?: boolean;
}

export interface ControlComponentsGroupAccessOutput
  extends ControlComponentsGroupAccess {
  groupName: string;
}
