import { Group } from '../../groups/group.entity';
import { Discipline } from '../../disciplines/discipline.entity';
import { ShortProfile, User } from '../../users/user.entity';
import { ControlComponentsTaskVariants } from '../../control-components-tasks/entities/control-components-task-variants.entity';
import MarksAdditionalColumnsOutputDTO from '../../marks-additional-columns/dto/marks-additional-columns-output.dto';
export interface ActivitiesWithMarks {
  activityID: number;
  attendance: string;
  activityName: string;
  controlComponents: {
    controlComponentID: number;
    point: number;
    name: string;
    autocheck: boolean;
    threshold: number;
    maxPoint: number;
    minPoint: number;
    showStudentCorrectAnswer: boolean;
    sessionID: string;
    penalty: number;
    type: string;
    tasks: {
      taskID: number;
      maxPoint: number;
      point: number;
      index: number;
      type: string;
    }[];
  }[];
}

export interface StudentMarks {
  student: ShortProfile;
  studentMarks: ActivitiesWithMarks[];
}

export default interface GroupMarks {
  group: Group;
  discipline: Discipline;
  marks: StudentMarks[];
  additionalColumns: MarksAdditionalColumnsOutputDTO[];
}

export interface StudentAllMarks {
  student: User;
  marks: StudentDisciplineMarks[];
}
export interface StudentDisciplineMarks {
  discipline: Discipline;
  studentMarks: ActivitiesWithMarks[];
  additionalColumns: MarksAdditionalColumnsOutputDTO[];
}
