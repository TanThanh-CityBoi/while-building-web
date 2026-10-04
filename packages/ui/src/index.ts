// The original CSS Modules kit (used by the public site). Styles: import
// '@while-building/ui/styles.css' once per app (tokens + reset). The CMS uses the
// shadcn/ui components instead: '@while-building/ui/components/*' + 'globals.css'.

export { Alert, type AlertProps } from './legacy/Alert';
export { Avatar, type AvatarProps } from './legacy/Avatar';
export { Badge, type BadgeProps, type BadgeTone } from './legacy/Badge';
export {
  Button,
  buttonClassName,
  type ButtonProps,
  type ButtonSize,
  type ButtonStyleOptions,
  type ButtonVariant,
} from './legacy/Button';
export { Card, CardHeader, type CardHeaderProps, type CardProps } from './legacy/Card';
export { Dialog, DialogBody, DialogFooter, type DialogProps } from './legacy/Dialog';
export {
  Dropdown,
  type DropdownEntry,
  type DropdownItem,
  type DropdownProps,
  type DropdownSeparator,
} from './legacy/Dropdown';
export { FormField, type FieldControlProps, type FormFieldProps } from './legacy/FormField';
export { Input, type InputProps } from './legacy/Input';
export { PageContainer } from './legacy/PageContainer';
export { PageHeader, type PageHeaderProps } from './legacy/PageHeader';
export { Select, type SelectOption, type SelectProps } from './legacy/Select';
export { Spinner } from './legacy/Spinner';
export {
  EmptyState,
  ErrorState,
  LoadingState,
  type EmptyStateProps,
  type ErrorStateProps,
  type LoadingStateProps,
} from './legacy/States';
export {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeaderCell,
  TableRow,
  type TableCellProps,
  type TableHeaderCellProps,
} from './legacy/Table';
export { Tag, TagList, type TagListProps, type TagProps } from './legacy/Tag';
export { Textarea, type TextareaProps } from './legacy/Textarea';
