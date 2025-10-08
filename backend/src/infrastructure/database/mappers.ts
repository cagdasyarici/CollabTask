import type {
  User as CoreUser,
  Project as CoreProject,
  Task as CoreTask,
  Subtask as CoreSubtask,
  Comment as CoreComment,
  Attachment as CoreAttachment,
  Team as CoreTeam,
  Notification as CoreNotification,
  Activity as CoreActivity,
  Priority as CorePriority,
  TaskStatus as CoreTaskStatus,
  ProjectStatus as CoreProjectStatus,
  ProjectVisibility as CoreProjectVisibility,
  UserRole as CoreUserRole,
  UserStatus as CoreUserStatus,
} from 'collabtask-core';
import type { Activity, Attachment, Comment, Notification, Prisma, Project, ProjectSettings, Subtask, Task, Team, TimeEntry, User } from '@prisma/client';

// ---- Enum mappers ----
export function mapUserRole(role: User['role']): CoreUserRole {
  switch (role) {
    case 'ADMIN': return 'admin';
    case 'MANAGER': return 'manager';
    default: return 'member';
  }
}

export function mapUserStatus(status: User['status']): CoreUserStatus {
  switch (status) {
    case 'ACTIVE': return 'active';
    case 'INACTIVE': return 'inactive';
    default: return 'invited';
  }
}

export function mapProjectStatus(status: Project['status']): CoreProjectStatus {
  switch (status) {
    case 'ACTIVE': return 'active';
    case 'PAUSED': return 'paused';
    case 'COMPLETED': return 'completed';
    default: return 'archived';
  }
}

export function mapProjectVisibility(v: Project['visibility']): CoreProjectVisibility {
  switch (v) {
    case 'PUBLIC': return 'public';
    case 'PRIVATE': return 'private';
    default: return 'team';
  }
}

export function mapPriority(p: Task['priority'] | Project['priority']): CorePriority {
  switch (p) {
    case 'LOW': return 'low';
    case 'HIGH': return 'high';
    case 'URGENT': return 'urgent';
    default: return 'medium';
  }
}

export function mapTaskStatus(s: Task['status']): CoreTaskStatus {
  switch (s) {
    case 'BACKLOG': return 'backlog';
    case 'TODO': return 'todo';
    case 'IN_PROGRESS': return 'in_progress';
    case 'REVIEW': return 'review';
    default: return 'done';
  }
}

// ---- Helpers ----
function toIso(d?: Date | null): string | undefined {
  return d ? d.toISOString() : undefined;
}

// ---- Entity mappers ----
export function mapUserEntity(user: User): CoreUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    role: mapUserRole(user.role),
    status: mapUserStatus(user.status),
    createdAt: user.createdAt.toISOString(),
    lastActive: toIso(user.lastActive),
    timezone: user.timezone ?? undefined,
    position: user.position ?? undefined,
    department: user.department ?? undefined,
  };
}

type ProjectWithSettings = Project & { settings?: ProjectSettings | null; members?: { userId: string }[]; teams?: { teamId: string }[] };

export function mapProjectEntity(project: ProjectWithSettings): CoreProject {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    color: project.color,
    icon: project.icon,
    status: mapProjectStatus(project.status),
    visibility: mapProjectVisibility(project.visibility),
    ownerId: project.ownerId,
    teamIds: (project.teams ?? []).map((t) => t.teamId),
    memberIds: (project.members ?? []).map((m) => m.userId),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    dueDate: toIso(project.dueDate),
    progress: project.progress,
    priority: mapPriority(project.priority),
    template: project.template ?? undefined,
    tags: project.tags,
    settings: {
      allowComments: project.settings?.allowComments ?? true,
      allowAttachments: project.settings?.allowAttachments ?? true,
      requireApproval: project.settings?.requireApproval ?? false,
      timeTracking: project.settings?.timeTracking ?? false,
    },
  };
}

type TaskWithRels = Task & {
  assignees?: { userId: string }[];
  comments?: Comment[];
  attachments?: Attachment[];
  subtasks?: Subtask[];
  dependencies?: { prerequisiteTaskId: string }[];
};

export function mapTaskEntity(task: TaskWithRels): CoreTask {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: mapTaskStatus(task.status),
    priority: mapPriority(task.priority),
    projectId: task.projectId,
    assigneeIds: (task.assignees ?? []).map((a) => a.userId),
    reporterId: task.reporterId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    dueDate: toIso(task.dueDate),
    startDate: toIso(task.startDate),
    completedAt: toIso(task.completedAt),
    estimatedHours: task.estimatedHours ?? undefined,
    actualHours: task.actualHours ?? undefined,
    tags: task.tags,
    attachments: (task.attachments ?? []).map(mapAttachmentEntity),
    comments: (task.comments ?? []).map(mapCommentEntity),
    dependencies: (task.dependencies ?? []).map((d) => d.prerequisiteTaskId),
    subtasks: (task.subtasks ?? []).map(mapSubtaskEntity),
    customFields: {},
    position: task.position,
  };
}

export function mapSubtaskEntity(s: Subtask): CoreSubtask {
  return {
    id: s.id,
    title: s.title,
    completed: s.completed,
    assigneeId: s.assigneeId ?? undefined,
    dueDate: toIso(s.dueDate),
    createdAt: s.createdAt.toISOString(),
  };
}

export function mapCommentEntity(c: Comment): CoreComment {
  return {
    id: c.id,
    content: c.content,
    authorId: c.authorId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    mentions: c.mentions ?? [],
    attachments: [],
    reactions: [],
  };
}

export function mapAttachmentEntity(a: Attachment): CoreAttachment {
  return {
    id: a.id,
    name: a.name,
    url: a.url,
    type: a.type,
    size: a.size,
    uploadedBy: a.uploadedById,
    uploadedAt: a.uploadedAt.toISOString(),
  };
}

export function mapTeamEntity(t: Team & { members?: { userId: string }[] }): CoreTeam {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    memberIds: (t.members ?? []).map((m) => m.userId),
    leaderId: t.leaderId,
    createdAt: t.createdAt.toISOString(),
    color: t.color,
    department: t.department ?? undefined,
  };
}

export function mapNotificationEntity(n: Notification): CoreNotification {
  return {
    id: n.id,
    type: ((): CoreNotification['type'] => {
      switch (n.type) {
        case 'TASK_ASSIGNED': return 'task_assigned';
        case 'TASK_COMPLETED': return 'task_completed';
        case 'COMMENT_ADDED': return 'comment_added';
        case 'DUE_DATE_REMINDER': return 'due_date_reminder';
        case 'PROJECT_INVITATION': return 'project_invitation';
        default: return 'mention';
      }
    })(),
    title: n.title,
    message: n.message,
    userId: n.userId,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
    updatedAt: undefined,
    relatedId: n.relatedId ?? undefined,
    relatedType: (n.relatedType as CoreNotification['relatedType']) ?? undefined,
    actionUrl: n.actionUrl ?? undefined,
  };
}

export function mapActivityEntity(a: Activity): CoreActivity {
  return {
    id: a.id,
    type: ((): CoreActivity['type'] => {
      switch (a.type) {
        case 'TASK_CREATED': return 'task_created';
        case 'TASK_UPDATED': return 'task_updated';
        case 'TASK_COMPLETED': return 'task_completed';
        case 'PROJECT_CREATED': return 'project_created';
        case 'USER_JOINED': return 'user_joined';
        default: return 'comment_added';
      }
    })(),
    userId: a.userId,
    projectId: a.projectId ?? undefined,
    taskId: a.taskId ?? undefined,
    description: a.description,
    createdAt: a.createdAt.toISOString(),
    metadata: a.metadata as Record<string, string | number | boolean> | undefined,
  };
}



