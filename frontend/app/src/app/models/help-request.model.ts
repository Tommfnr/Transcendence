export type HelpRequestTagIcon = 'calendar' | 'tag';

export interface HelpRequestTag {
  icon: HelpRequestTagIcon;
  label: string;
}

export type HelpRequestStatus = 'open' | 'pending' | 'done';

export interface HelpRequest {
  id: number;
  authorName: string;
  groupName: string;
  timeAgo: string;
  title: string;
  description: string;
  tags: HelpRequestTag[];
  /** Defaults to 'open' — the card then shows its call-to-action. */
  status?: HelpRequestStatus;
}
