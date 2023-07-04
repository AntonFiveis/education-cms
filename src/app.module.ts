import { Module } from '@nestjs/common';
import { ArticlesModule } from './modules/articles/articles.module';
import { UsersModule } from './modules/users/users.module';
import { RolesPrivilegesModule } from './modules/roles-privileges/roles-privileges.module';
import { NewsModule } from './modules/news/news.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { TokensModule } from './modules/tokens/tokens.module';
import { DisciplinesModule } from './modules/disciplines/disciplines.module';
import { DisciplinesTeacherAccessModule } from './modules/disciplines-teacher-access/disciplines-teacher-access.module';
import { GroupsModule } from './modules/groups/groups.module';
import { UsersRolesModule } from './modules/users-roles/users-roles.module';
import { GroupMembersModule } from './modules/group-members/group-members.module';
import { DisciplinesGroupAccessModule } from './modules/disciplines-group-access/disciplines-group-access.module';
import { AbstractPostModule } from './modules/abstract-post/abstract-post.module';
import { ImageMinModule } from './modules/image-min/image-min.module';
import { SaveFileModule } from './modules/save-file/save-file.module';
import { AvatarsModule } from './modules/avatars/avatars.module';
import { DisciplinesAnnotationModule } from './modules/disciplines-annotation/disciplines-annotation.module';
import { DisciplinesInformationModule } from './modules/disciplines-information/disciplines-information.module';
import { ActivityModule } from './modules/activity/activity.module';
import { ActivityContentModule } from './modules/activity-content/activity-content.module';
import { ActivityComponentModule } from './modules/activity-component/activity-component.module';
import { ControlComponentsModule } from './modules/control-components/control-components.module';
import { ControlComponentsTasksModule } from './modules/control-components-tasks/control-components-tasks.module';
import { UsersTaskSetsModule } from './modules/users-task-sets/users-task-sets.module';
import { MarksModule } from './modules/marks/marks.module';
import { MarksAdditionalColumnsModule } from './modules/marks-additional-columns/marks-additional-columns.module';
import { ControlComponentsGroupAccessModule } from './modules/control-components-group-access/control-components-group-access.module';

@Module({
  imports: [
    ArticlesModule,
    UsersModule,
    RolesPrivilegesModule,
    NewsModule,
    AnnouncementsModule,
    TokensModule,
    DisciplinesModule,
    DisciplinesTeacherAccessModule,
    GroupsModule,
    UsersRolesModule,
    GroupMembersModule,
    DisciplinesGroupAccessModule,
    AbstractPostModule,
    ImageMinModule,
    SaveFileModule,
    AvatarsModule,
    DisciplinesAnnotationModule,
    DisciplinesInformationModule,
    ActivityModule,
    ActivityContentModule,
    ActivityComponentModule,
    ControlComponentsModule,
    ControlComponentsTasksModule,
    UsersTaskSetsModule,
    MarksModule,
    MarksAdditionalColumnsModule,
    ControlComponentsGroupAccessModule,
  ],
})
export class AppModule {}
