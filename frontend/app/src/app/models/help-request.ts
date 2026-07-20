export type HelpRequestTagIcon = 'calendar' | 'tag';

export interface HelpRequestTag {
  icon: HelpRequestTagIcon;
  label: string;
}

export interface HelpRequest {
  id: number;
  authorName: string;
  groupName: string;
  timeAgo: string;
  title: string;
  description: string;
  tags: HelpRequestTag[];
}
