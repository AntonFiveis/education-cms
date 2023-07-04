export class RolesPrivileges {
  roleID: number;
  roleName: string;
  articlesAdder: boolean;
  articlesUpdater: boolean;
  articlesRemover: boolean;
  newsAdder: boolean;
  newsUpdater: boolean;
  newsRemover: boolean;
  rolesChanger: boolean;
  announcementsAdder: boolean;
  announcementsUpdater: boolean;
  announcementsRemover: boolean;
  disciplinesAdder: boolean;
  groupAdder: boolean;
  groupRemover: boolean;
  groupMemberAdder: boolean;
  groupMemberRemover: boolean;
  disciplinesAccepter: boolean;
  static tableName = 'RolesPrivileges';
}
export class RolesPrivilegesUpdates {
  roleID: number;
  articlesAdder: boolean;
  articlesUpdater: boolean;
  articlesRemover: boolean;
  newsAdder: boolean;
  newsUpdater: boolean;
  newsRemover: boolean;
  rolesChanger: boolean;
  announcementsAdder: boolean;
  announcementsUpdater: boolean;
  announcementsRemover: boolean;
  disciplinesAdder: boolean;
  groupAdder: boolean;
  groupRemover: boolean;
  groupMemberAdder: boolean;
  groupMemberRemover: boolean;
  disciplinesAccepter: boolean;
}
